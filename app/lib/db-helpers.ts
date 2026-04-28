// Helper để map weekday từ database format sang T2-CN
export function mapWeekday(weekday: string | number): DayKey {
  const map: Record<string | number, DayKey> = {
    T2: "T2",
    T3: "T3",
    T4: "T4",
    T5: "T5",
    T6: "T6",
    T7: "T7",
    CN: "CN",
    "0": "CN",
    "1": "T2",
    "2": "T3",
    "3": "T4",
    "4": "T5",
    "5": "T6",
    "6": "T7",
    Monday: "T2",
    Tuesday: "T3",
    Wednesday: "T4",
    Thursday: "T5",
    Friday: "T6",
    Saturday: "T7",
    Sunday: "CN",
  };
  return map[weekday] || "T2";
}

// Map period_no sang time (deprecated - not used)
export function mapPeriodToTime(): string {
  return "";
}

export type DayKey = "T2" | "T3" | "T4" | "T5" | "T6" | "T7" | "CN";

export type ScheduleEntry = {
  id: string;
  day: DayKey;
  time: string;
  periodNo: number;
  subject: string;
  room: string;
  type: "class" | "extra";
};
