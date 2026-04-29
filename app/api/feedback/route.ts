const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function feedbackHeaders() {
  return {
    apikey: SUPABASE_KEY || "",
    Authorization: `Bearer ${SUPABASE_KEY || ""}`,
    Accept: "application/json",
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };
}

export async function POST(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return Response.json(
      { error: "Thiếu cấu hình Supabase." },
      { status: 500 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { error: "Dữ liệu gửi lên không hợp lệ." },
      { status: 400 },
    );
  }

  const content =
    typeof payload === "object" && payload !== null && "content" in payload
      ? String((payload as { content?: unknown }).content ?? "").trim()
      : "";

  if (!content) {
    return Response.json(
      { error: "Nội dung góp ý không được để trống." },
      { status: 400 },
    );
  }

  if (content.length > 2000) {
    return Response.json(
      { error: "Góp ý không được vượt quá 2000 ký tự." },
      { status: 400 },
    );
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/feedbacks`, {
    method: "POST",
    headers: feedbackHeaders(),
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const details = await response.text();
    return Response.json(
      { error: "Không thể lưu góp ý vào database.", details },
      { status: response.status },
    );
  }

  return Response.json({ ok: true });
}
