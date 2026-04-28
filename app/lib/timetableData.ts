export type DayKey = "T2" | "T3" | "T4" | "T5" | "T6" | "T7" | "CN";

export type ScheduleEntry = {
  id: string;
  day: DayKey;
  time: string;
  subject: string;
  room: string;
  type: "class" | "extra";
};

export type ClassInfo = {
  id: string;
  name: string;
  grade: string;
  homeroom: string;
};

export type Student = {
  id: string;
  name: string;
  classId: string;
  extraSubjects: string[];
};

export const dayOrder: DayKey[] = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export const dayLabels: Record<DayKey, string> = {
  T2: "Thu 2",
  T3: "Thu 3",
  T4: "Thu 4",
  T5: "Thu 5",
  T6: "Thu 6",
  T7: "Thu 7",
  CN: "Chu nhat",
};

export const classes: ClassInfo[] = [
  { id: "10A1", name: "10A1", grade: "Khoi 10", homeroom: "Co Lan" },
  { id: "10A2", name: "10A2", grade: "Khoi 10", homeroom: "Thay Minh" },
  { id: "12B1", name: "12B1", grade: "Khoi 12", homeroom: "Co Thao" },
];

export const students: Student[] = [
  {
    id: "s1",
    name: "Nguyen Minh Anh",
    classId: "10A1",
    extraSubjects: ["Toan on TN", "Tieng Anh on TN"],
  },
  {
    id: "s2",
    name: "Tran Gia Bao",
    classId: "10A1",
    extraSubjects: ["Ngu van on TN"],
  },
  {
    id: "s3",
    name: "Le Thu Ha",
    classId: "10A2",
    extraSubjects: ["Toan on TN", "Vat ly on TN"],
  },
  {
    id: "s4",
    name: "Pham Quang Huy",
    classId: "12B1",
    extraSubjects: ["Tieng Anh on TN", "Toan on TN"],
  },
  {
    id: "s5",
    name: "Bui Thu Trang",
    classId: "12B1",
    extraSubjects: ["Ngu van on TN"],
  },
];

export const classSchedules: Record<string, ScheduleEntry[]> = {
  "10A1": [
    {
      id: "10A1-t2-1",
      day: "T2",
      time: "07:15-08:45",
      subject: "Toan",
      room: "A1-201",
      type: "class",
    },
    {
      id: "10A1-t2-2",
      day: "T2",
      time: "09:00-10:30",
      subject: "Vat ly",
      room: "A1-201",
      type: "class",
    },
    {
      id: "10A1-t3-1",
      day: "T3",
      time: "07:15-08:45",
      subject: "Hoa hoc",
      room: "A1-202",
      type: "class",
    },
    {
      id: "10A1-t3-2",
      day: "T3",
      time: "09:00-10:30",
      subject: "Ngu van",
      room: "A1-202",
      type: "class",
    },
    {
      id: "10A1-t4-1",
      day: "T4",
      time: "13:30-15:00",
      subject: "Lich su",
      room: "A1-303",
      type: "class",
    },
    {
      id: "10A1-t5-1",
      day: "T5",
      time: "07:15-08:45",
      subject: "Sinh hoc",
      room: "A1-204",
      type: "class",
    },
    {
      id: "10A1-t6-1",
      day: "T6",
      time: "09:00-10:30",
      subject: "Tieng Anh",
      room: "A1-205",
      type: "class",
    },
  ],
  "10A2": [
    {
      id: "10A2-t2-1",
      day: "T2",
      time: "07:15-08:45",
      subject: "Toan",
      room: "A2-201",
      type: "class",
    },
    {
      id: "10A2-t3-1",
      day: "T3",
      time: "09:00-10:30",
      subject: "Ngu van",
      room: "A2-202",
      type: "class",
    },
    {
      id: "10A2-t4-1",
      day: "T4",
      time: "07:15-08:45",
      subject: "Dia ly",
      room: "A2-203",
      type: "class",
    },
    {
      id: "10A2-t4-2",
      day: "T4",
      time: "09:00-10:30",
      subject: "Giao duc cong dan",
      room: "A2-203",
      type: "class",
    },
    {
      id: "10A2-t5-1",
      day: "T5",
      time: "13:30-15:00",
      subject: "Hoa hoc",
      room: "A2-305",
      type: "class",
    },
    {
      id: "10A2-t6-1",
      day: "T6",
      time: "07:15-08:45",
      subject: "Tieng Anh",
      room: "A2-204",
      type: "class",
    },
  ],
  "12B1": [
    {
      id: "12B1-t2-1",
      day: "T2",
      time: "07:15-08:45",
      subject: "Toan",
      room: "B1-201",
      type: "class",
    },
    {
      id: "12B1-t2-2",
      day: "T2",
      time: "09:00-10:30",
      subject: "Ngu van",
      room: "B1-201",
      type: "class",
    },
    {
      id: "12B1-t3-1",
      day: "T3",
      time: "07:15-08:45",
      subject: "Vat ly",
      room: "B1-202",
      type: "class",
    },
    {
      id: "12B1-t4-1",
      day: "T4",
      time: "09:00-10:30",
      subject: "Hoa hoc",
      room: "B1-203",
      type: "class",
    },
    {
      id: "12B1-t5-1",
      day: "T5",
      time: "07:15-08:45",
      subject: "Tieng Anh",
      room: "B1-204",
      type: "class",
    },
    {
      id: "12B1-t6-1",
      day: "T6",
      time: "13:30-15:00",
      subject: "Lich su",
      room: "B1-305",
      type: "class",
    },
  ],
};

export const extraSubjectSchedules: Record<string, ScheduleEntry[]> = {
  "Toan on TN": [
    {
      id: "extra-toan-t3-1",
      day: "T3",
      time: "18:30-20:00",
      subject: "Toan on TN",
      room: "Phong On 1",
      type: "extra",
    },
    {
      id: "extra-toan-t6-1",
      day: "T6",
      time: "18:30-20:00",
      subject: "Toan on TN",
      room: "Phong On 1",
      type: "extra",
    },
  ],
  "Ngu van on TN": [
    {
      id: "extra-van-t4-1",
      day: "T4",
      time: "18:30-20:00",
      subject: "Ngu van on TN",
      room: "Phong On 2",
      type: "extra",
    },
  ],
  "Tieng Anh on TN": [
    {
      id: "extra-anh-t2-1",
      day: "T2",
      time: "18:30-20:00",
      subject: "Tieng Anh on TN",
      room: "Phong Ngoai ngu",
      type: "extra",
    },
    {
      id: "extra-anh-t5-1",
      day: "T5",
      time: "18:30-20:00",
      subject: "Tieng Anh on TN",
      room: "Phong Ngoai ngu",
      type: "extra",
    },
  ],
  "Vat ly on TN": [
    {
      id: "extra-ly-t7-1",
      day: "T7",
      time: "08:00-09:30",
      subject: "Vat ly on TN",
      room: "Phong On 3",
      type: "extra",
    },
  ],
};

export const extraSubjects = Object.keys(extraSubjectSchedules).sort((a, b) =>
  a.localeCompare(b, "vi"),
);
