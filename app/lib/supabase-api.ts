const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

interface SupabaseOptions {
  select?: string;
  eq?: Record<string, string | number>;
  limit?: number;
}

async function supabaseQuery(table: string, options: SupabaseOptions = {}) {
  let url = `${SUPABASE_URL}/rest/v1/${table}`;

  const params = new URLSearchParams();

  if (options.select) {
    params.append("select", options.select);
  }

  if (options.eq) {
    for (const [key, value] of Object.entries(options.eq)) {
      params.append(`${key}=eq.${value}`, "");
    }
  }

  if (options.limit) {
    params.append("limit", options.limit.toString());
  }

  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      apikey: SUPABASE_KEY || "",
      "Content-Type": "application/json",
    },
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
  if (className) {
    const url = `${SUPABASE_URL}/rest/v1/students?class=eq.${className}&select=id,name,class`;
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY || "",
        "Content-Type": "application/json",
      },
    });
    if (!response.ok)
      throw new Error(`Failed to fetch students: ${response.status}`);
    return response.json();
  }
  return supabaseQuery("students", { select: "id, name, class" });
}

export async function getClassTimetable(className: string) {
  const url = `${SUPABASE_URL}/rest/v1/class_timetable?class_name=eq.${className}`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY || "",
      "Content-Type": "application/json",
    },
  });
  if (!response.ok)
    throw new Error(`Failed to fetch class timetable: ${response.status}`);
  return response.json();
}

export async function getStudentExtraSubjects(studentId: number) {
  const url = `${SUPABASE_URL}/rest/v1/student_subjects?student_id=eq.${studentId}`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY || "",
      "Content-Type": "application/json",
    },
  });
  if (!response.ok)
    throw new Error(`Failed to fetch student subjects: ${response.status}`);
  return response.json();
}

export async function getExtraSubjectTimetable(subjectName: string) {
  const url = `${SUPABASE_URL}/rest/v1/thpt_timetable?subject_name=eq.${subjectName}`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY || "",
      "Content-Type": "application/json",
    },
  });
  if (!response.ok)
    throw new Error(`Failed to fetch subject timetable: ${response.status}`);
  return response.json();
}

export async function getAllSubjects() {
  return supabaseQuery("subjects", { select: "name" });
}
