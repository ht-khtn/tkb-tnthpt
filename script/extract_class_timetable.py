#!/usr/bin/env python3
"""Extract class timetable rows for grade-12 classes from TKB Lop.docx.

Output CSV columns:
- id
- weekday
- period_no
- class_name
- subject_name

The source document stores one timetable per table. For grade 12, the
relevant tables are mapped to classes by the discovered table order.
"""

from __future__ import annotations

import argparse
import csv
from pathlib import Path

from docx import Document  # type: ignore


BASE_DIR = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = BASE_DIR / "word" / "TKB Lop.docx"
DEFAULT_OUTPUT = BASE_DIR / "csv" / "class_timetable.csv"

# Mapping discovered from the document order for grade-12 timetable pages.
# Key: 1-based table index in the docx file.
TABLE_CLASS_MAP: dict[int, str] = {
    17: "12A1",
    18: "12A2",
    19: "12A4",
    20: "12A6",
    21: "12A8",
    22: "12A5",
    23: "12A7",
    24: "12A9",
    25: "12A10",
}


def clean_text(value: str) -> str:
    return " ".join(value.replace("\xa0", " ").split()).strip()


def extract_entries(input_path: Path) -> list[dict[str, str]]:
    doc = Document(str(input_path))
    entries: list[dict[str, str]] = []

    for table_idx, table in enumerate(doc.tables, start=1):
        class_name = TABLE_CLASS_MAP.get(table_idx)
        if not class_name:
            continue

        if not table.rows:
            continue

        header_cells = table.rows[0].cells
        weekdays = [clean_text(cell.text) for cell in header_cells[2:]]

        for row in table.rows[1:]:
            period_no = clean_text(row.cells[1].text)
            if not period_no:
                continue

            for weekday, cell in zip(weekdays, row.cells[2:]):
                subject_name = clean_text(cell.text)
                if not weekday or not subject_name:
                    continue

                entries.append(
                    {
                        "weekday": weekday,
                        "period_no": period_no,
                        "class_name": class_name,
                        "subject_name": subject_name,
                    }
                )

    for idx, entry in enumerate(entries, start=1):
        entry["id"] = str(idx)

    return entries


def write_csv(output_path: Path, entries: list[dict[str, str]]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["id", "weekday", "period_no", "class_name", "subject_name"],
        )
        writer.writeheader()
        writer.writerows(entries)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract class timetable CSV")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    entries = extract_entries(args.input)
    write_csv(args.output, entries)

    classes = sorted({entry["class_name"] for entry in entries})
    print(f"Extracted {len(entries)} rows to {args.output}")
    print("Classes: " + ", ".join(classes))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
