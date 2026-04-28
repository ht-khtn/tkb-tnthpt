const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function supabaseHeaders() {
  return {
    apikey: SUPABASE_KEY || "",
    Authorization: `Bearer ${SUPABASE_KEY || ""}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

interface SupabaseOptions {
  select?: string;
  eq?: Record<string, string | number>;
  limit?: number;
}

function buildSupabaseUrl(table: string, options: SupabaseOptions = {}) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);

  if (options.select) {
    url.searchParams.set("select", options.select);
  }

  if (options.eq) {
    for (const [key, value] of Object.entries(options.eq)) {
      url.searchParams.set(key, `eq.${value}`);
    }
  }

  if (options.limit) {
    url.searchParams.set("limit", options.limit.toString());
  }

  return url.toString();
}

async function supabaseQuery(table: string, options: SupabaseOptions = {}) {
  const response = await fetch(buildSupabaseUrl(table, options), {
    method: "GET",
    headers: supabaseHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `Supabase API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

export async function getClasses() {
  return supabaseQuery("classes", { select: "name, homeroom_teacher" });
}

export async function getStudents(className?: string) {
  return supabaseQuery("students", {
    select: "id, name, class",
    eq: className ? { class: className } : undefined,
  });
}

export async function getClassTimetable(className: string) {
  return supabaseQuery("class_timetable", {
    select: "id,weekday,period_no,subject_name,class_name",
    eq: { class_name: className },
  });
}

export async function getStudentExtraSubjects(studentId: number) {
  return supabaseQuery("student_subjects", {
    select: "subject_name",
    eq: { student_id: studentId },
  });
}

export async function getExtraSubjectTimetable(subjectName: string) {
  return supabaseQuery("thpt_timetable", {
    select: "id,weekday,period_no,subject_name,location",
    eq: { subject_name: subjectName },
  });
}

export async function getAllSubjects() {
  return supabaseQuery("subjects", { select: "name" });
}

export async function getStudentsBySubject(subjectName: string) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/student_subjects?select=student_id&subject_name=eq.${encodeURIComponent(subjectName)}`,
    {
      method: "GET",
      headers: supabaseHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Supabase API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  return (data as Array<{ student_id: string }>).map((row) =>
    parseInt(row.student_id, 10),
  );
}
