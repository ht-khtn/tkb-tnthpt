export const PINK_THEME_CLASS = "12A5";
export const PINK_THEME_STUDENT = "HUỲNH THỊ NGỌC NGÂN";
export const TKB_STORAGE_CLASS_KEY = "tkb:selectedClass";
export const TKB_STORAGE_STUDENT_KEY = "tkb:selectedStudent";

export function isPinkTheme(
  classId: string | null,
  studentName: string | null,
) {
  return classId === PINK_THEME_CLASS && studentName === PINK_THEME_STUDENT;
}

export function applyTheme(isPink: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = isPink ? "pink" : "teal";
}

export function getStoredTkbSelection() {
  if (typeof window === "undefined") {
    return { classId: null as string | null, studentId: null as string | null };
  }

  return {
    classId: window.localStorage.getItem(TKB_STORAGE_CLASS_KEY),
    studentId: window.localStorage.getItem(TKB_STORAGE_STUDENT_KEY),
  };
}
