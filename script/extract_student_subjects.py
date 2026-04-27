#!/usr/bin/env python3
"""Extract and merge tables from Word files into one CSV.

Behavior:
- Read all .docx files under word/ds-lop.
- Treat each table as belonging to its current page.
- Append page number to values in the subject column (header contains "mon").
- Merge all tables from all files into one CSV: student_subjects.csv.
"""

from __future__ import annotations

import argparse
import csv
import platform
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any, Dict, Iterable, List, Sequence, Tuple

try:
    from docx import Document  # type: ignore
except Exception as exc:  # pragma: no cover
    raise SystemExit(
        "python-docx is required. Install with: pip install python-docx"
    ) from exc


def normalize_text(value: str) -> str:
    """Lowercase and strip accents/symbols for robust header matching."""
    value = value.strip().lower()
    decomposed = unicodedata.normalize("NFD", value)
    no_accent = "".join(ch for ch in decomposed if unicodedata.category(ch) != "Mn")
    return "".join(ch for ch in no_accent if ch.isalnum())


def clean_cell_text(text: str) -> str:
    return " ".join(text.replace("\xa0", " ").split()).strip()


def clean_word_cell_text(text: str) -> str:
    """Remove Word table end-of-cell markers before normalization."""
    # Word COM table cell text often ends with "\r\x07".
    return text.replace("\r\x07", "").replace("\x07", "").replace("\r", " ")


def count_page_breaks_in_paragraph(paragraph) -> int:
    """Count explicit page-break markers in a paragraph XML node."""
    br_count = len(paragraph._p.xpath('.//w:br[@w:type="page"]'))
    rendered_break_count = len(paragraph._p.xpath('.//w:lastRenderedPageBreak'))
    return br_count + rendered_break_count


def iter_tables_with_page_numbers(doc: Any) -> Iterable[Tuple[object, int]]:
    """Yield each table with its inferred page number.

    Page starts at 1 and increments whenever an explicit page break is seen.
    """
    body = doc.element.body
    current_page = 1
    table_index = 0

    # Pre-load python-docx table list so we can map XML table nodes to objects.
    all_tables = list(doc.tables)

    for child in body.iterchildren():
        tag = child.tag.rsplit("}", 1)[-1]
        if tag == "p":
            # Map XML paragraph to python-docx paragraph object lazily via wrappers.
            # We only need page-break count from XML.
            class _Tmp:
                _p = child

            current_page += count_page_breaks_in_paragraph(_Tmp)
        elif tag == "tbl":
            if table_index < len(all_tables):
                yield all_tables[table_index], current_page
                table_index += 1


def extract_rows_from_table(table) -> List[List[str]]:
    rows: List[List[str]] = []
    for row in table.rows:
        rows.append([clean_cell_text(cell.text) for cell in row.cells])
    return rows


def find_header_row(rows: Sequence[Sequence[str]]) -> int:
    for idx, row in enumerate(rows):
        if any(cell.strip() for cell in row):
            return idx
    return -1


def find_subject_col_index(header: Sequence[str]) -> int:
    normalized = [normalize_text(h) for h in header]
    for idx, col_name in enumerate(normalized):
        if "mon" in col_name:
            return idx
    return -1


def find_stt_col_index(header: Sequence[str]) -> int:
    normalized = [normalize_text(h) for h in header]
    for idx, col_name in enumerate(normalized):
        if col_name == "stt":
            return idx
    return -1


def parse_stt(value: str) -> int | None:
    match = re.match(r"\s*(\d+)", value)
    if not match:
        return None
    try:
        return int(match.group(1))
    except ValueError:
        return None


def split_subject_and_page(subject_value: str) -> str:
    """Return subject text without trailing page number."""
    return re.sub(r"\s+\d+\s*$", "", subject_value).strip()


def table_to_dict_rows(table_rows: List[List[str]], page_number: int) -> Tuple[List[str], List[Dict[str, str]]]:
    header_idx = find_header_row(table_rows)
    if header_idx < 0:
        return [], []

    header = table_rows[header_idx]
    if not any(header):
        return [], []

    # Make sure duplicate/empty headers are still unique and stable.
    seen: Dict[str, int] = {}
    normalized_header: List[str] = []
    for i, col in enumerate(header):
        base = col if col else f"column_{i + 1}"
        count = seen.get(base, 0) + 1
        seen[base] = count
        normalized_header.append(base if count == 1 else f"{base}_{count}")

    subject_idx = find_subject_col_index(normalized_header)
    stt_idx = find_stt_col_index(normalized_header)
    current_page = page_number
    prev_stt: int | None = None

    data_rows = []
    for row in table_rows[header_idx + 1 :]:
        if not any(cell.strip() for cell in row):
            continue

        padded = list(row) + [""] * max(0, len(normalized_header) - len(row))
        padded = padded[: len(normalized_header)]

        # If STT resets from an increasing sequence back to 1, treat as next page.
        if 0 <= stt_idx < len(padded):
            stt_num = parse_stt(padded[stt_idx])
            if stt_num is not None:
                if prev_stt is not None and stt_num == 1 and prev_stt > 1:
                    current_page += 1
                prev_stt = stt_num

        if 0 <= subject_idx < len(padded) and padded[subject_idx]:
            padded[subject_idx] = f"{padded[subject_idx]} {current_page}"

        data_rows.append(dict(zip(normalized_header, padded)))

    return normalized_header, data_rows


def process_docx_file(path: Path) -> Tuple[List[str], List[Dict[str, str]]]:
    doc = Document(str(path))
    file_columns: List[str] = []
    file_rows: List[Dict[str, str]] = []

    for table_idx, (table, _page_num) in enumerate(iter_tables_with_page_numbers(doc), start=1):
        rows = extract_rows_from_table(table)
        # In this dataset, each page is one table, so table order maps to page number.
        columns, dict_rows = table_to_dict_rows(rows, table_idx)
        for col in columns:
            if col not in file_columns:
                file_columns.append(col)
        file_rows.extend(dict_rows)

    return file_columns, file_rows


def process_docx_file_word_com(path: Path, word_app) -> Tuple[List[str], List[Dict[str, str]]]:
    """Extract tables and page numbers using Microsoft Word COM automation."""
    file_columns: List[str] = []
    file_rows: List[Dict[str, str]] = []
    wd_active_end_page_number = 3

    doc = None
    try:
        doc = word_app.Documents.Open(
            str(path.resolve()),
            ReadOnly=True,
            AddToRecentFiles=False,
            Visible=False,
        )

        for table in doc.Tables:
            page_num = int(table.Range.Information(wd_active_end_page_number))
            max_rows = int(table.Rows.Count)
            max_cols = int(table.Columns.Count)
            matrix: List[List[str]] = []

            for row_idx in range(1, max_rows + 1):
                row_vals: List[str] = []
                for col_idx in range(1, max_cols + 1):
                    try:
                        cell_text = table.Cell(row_idx, col_idx).Range.Text
                    except Exception:
                        # Merged cells can make direct addressing fail.
                        cell_text = ""
                    row_vals.append(clean_cell_text(clean_word_cell_text(cell_text)))
                matrix.append(row_vals)

            columns, dict_rows = table_to_dict_rows(matrix, page_num)
            for col in columns:
                if col not in file_columns:
                    file_columns.append(col)
            file_rows.extend(dict_rows)
    finally:
        if doc is not None:
            doc.Close(False)

    return file_columns, file_rows


def merge_all_docx(input_dir: Path, engine: str) -> Tuple[List[str], List[Dict[str, str]]]:
    if not input_dir.exists():
        raise FileNotFoundError(f"Input directory not found: {input_dir}")

    paths = sorted(input_dir.glob("*.docx"), key=lambda p: p.name.lower())
    if not paths:
        raise FileNotFoundError(f"No .docx files found in: {input_dir}")

    merged_columns: List[str] = []
    merged_rows: List[Dict[str, str]] = []

    use_word_com = False
    word_app = None

    if engine in {"word-com", "auto"} and platform.system().lower() == "windows":
        try:
            import win32com.client  # type: ignore

            use_word_com = True
            word_app = win32com.client.Dispatch("Word.Application")
            word_app.Visible = False
            word_app.DisplayAlerts = 0
        except Exception:
            if engine == "word-com":
                raise RuntimeError(
                    "word-com engine requested but unavailable. Install pywin32 and Microsoft Word."
                )

    try:
        for path in paths:
            if use_word_com and word_app is not None:
                columns, rows = process_docx_file_word_com(path, word_app)
            else:
                columns, rows = process_docx_file(path)

            for col in columns:
                if col not in merged_columns:
                    merged_columns.append(col)
            merged_rows.extend(rows)
    finally:
        if word_app is not None:
            word_app.Quit()

    return merged_columns, merged_rows


def apply_page_numbers_by_stt(rows: List[Dict[str, str]]) -> None:
    """Set subject page by detecting STT reset from >1 to 1.

    Rule from user: whenever STT sequence climbs then returns to 1, it is a new page.
    """
    current_subject = ""
    current_page = 1
    prev_stt: int | None = None

    for row in rows:
        stt_val = row.get("STT", "")
        subject_val = row.get("Môn", "")
        if not subject_val:
            continue

        base_subject = split_subject_and_page(subject_val)
        if not base_subject:
            continue

        if base_subject != current_subject:
            current_subject = base_subject
            current_page = 1
            prev_stt = None

        stt_num = parse_stt(stt_val)
        if stt_num is not None:
            if prev_stt is not None and stt_num == 1 and prev_stt > 1:
                current_page += 1
            prev_stt = stt_num

        row["Môn"] = f"{base_subject} {current_page}"


def write_csv(output_csv: Path, columns: Sequence[str], rows: Sequence[Dict[str, str]]) -> None:
    output_csv.parent.mkdir(parents=True, exist_ok=True)
    with output_csv.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=list(columns), extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({col: row.get(col, "") for col in columns})


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract Word tables to one merged CSV")
    parser.add_argument(
        "--input-dir",
        default="word/ds-lop",
        type=Path,
        help="Directory containing .docx files",
    )
    parser.add_argument(
        "--output",
        default="student_subjects.csv",
        type=Path,
        help="Output CSV file path",
    )
    parser.add_argument(
        "--engine",
        default="auto",
        choices=["auto", "python-docx", "word-com"],
        help="Extraction engine. 'auto' prefers Word COM on Windows if available.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    try:
        columns, rows = merge_all_docx(args.input_dir, engine=args.engine)
        apply_page_numbers_by_stt(rows)
        write_csv(args.output, columns, rows)
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    print(f"Done. Extracted {len(rows)} rows to: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
