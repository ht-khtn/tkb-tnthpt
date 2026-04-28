// Helper để map weekday từ database format sang T2-CN
export function mapWeekday(weekday: string | number): string {
  const map: Record<string | number, string> = {
    "0": "CN",
    0: "CN",
    "1": "T2",
    1: "T2",
    "2": "T3",
    2: "T3",
    "3": "T4",
    3: "T4",
    "4": "T5",
    4: "T5",
    "5": "T6",
    5: "T6",
    "6": "T7",
    6: "T7",
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

// Map period_no sang time
export function mapPeriodToTime(periodNo: number): string {
  const times: Record<number, string> = {
    1: "07:15-08:45",
    2: "09:00-10:30",
    3: "10:45-12:15",
    4: "13:30-15:00",
    5: "15:15-16:45",
    6: "18:30-20:00",
  };
  return times[periodNo] || "07:15-08:45";
}

export type DayKey = "T2" | "T3" | "T4" | "T5" | "T6" | "T7" | "CN";

export type ScheduleEntry = {
  id: string;
  day: DayKey;
  time: string;
  subject: string;
  room: string;
  type: "class" | "extra";
};
