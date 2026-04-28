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
  T2: "Thứ 2",
  T3: "Thứ 3",
  T4: "Thứ 4",
  T5: "Thứ 5",
  T6: "Thứ 6",
  T7: "Thứ 7",
  CN: "Chủ nhật",
};

export const classes: ClassInfo[] = [
  { id: "10A1", name: "10A1", grade: "Khối 10", homeroom: "Cô Lan" },
  { id: "10A2", name: "10A2", grade: "Khối 10", homeroom: "Thầy Minh" },
  { id: "12B1", name: "12B1", grade: "Khối 12", homeroom: "Cô Thảo" },
];

export const students: Student[] = [
  {
    id: "s1",
    name: "Nguyễn Minh Anh",
    classId: "10A1",
    extraSubjects: ["Toán ôn TN", "Tiếng Anh ôn TN"],
  },
  {
    id: "s2",
    name: "Trần Gia Bảo",
    classId: "10A1",
    extraSubjects: ["Ngữ văn ôn TN"],
  },
  {
    id: "s3",
    name: "Lê Thu Hà",
    classId: "10A2",
    extraSubjects: ["Toán ôn TN", "Vật lý ôn TN"],
  },
  {
    id: "s4",
    name: "Phạm Quang Huy",
    classId: "12B1",
    extraSubjects: ["Tiếng Anh ôn TN", "Toán ôn TN"],
  },
  {
    id: "s5",
    name: "Bùi Thu Trang",
    classId: "12B1",
    extraSubjects: ["Ngữ văn ôn TN"],
  },
];

export const classSchedules: Record<string, ScheduleEntry[]> = {
  "10A1": [
    {
      id: "10A1-t2-1",
      day: "T2",
      time: "07:15-08:45",
      subject: "Toán",
      room: "A1-201",
      type: "class",
    },
    {
      id: "10A1-t2-2",
      day: "T2",
      time: "09:00-10:30",
      subject: "Vật lý",
      room: "A1-201",
      type: "class",
    },
    {
      id: "10A1-t3-1",
      day: "T3",
      time: "07:15-08:45",
      subject: "Hóa học",
      room: "A1-202",
      type: "class",
    },
    {
      id: "10A1-t3-2",
      day: "T3",
      time: "09:00-10:30",
      subject: "Ngữ văn",
      room: "A1-202",
      type: "class",
    },
    {
      id: "10A1-t4-1",
      day: "T4",
      time: "13:30-15:00",
      subject: "Lịch sử",
      room: "A1-303",
      type: "class",
    },
    {
      id: "10A1-t5-1",
      day: "T5",
      time: "07:15-08:45",
      subject: "Sinh học",
      room: "A1-204",
      type: "class",
    },
    {
      id: "10A1-t6-1",
      day: "T6",
      time: "09:00-10:30",
      subject: "Tiếng Anh",
      room: "A1-205",
      type: "class",
    },
  ],
  "10A2": [
    {
      id: "10A2-t2-1",
      day: "T2",
      time: "07:15-08:45",
      subject: "Toán",
      room: "A2-201",
      type: "class",
    },
    {
      id: "10A2-t3-1",
      day: "T3",
      time: "09:00-10:30",
      subject: "Ngữ văn",
      room: "A2-202",
      type: "class",
    },
    {
      id: "10A2-t4-1",
      day: "T4",
      time: "07:15-08:45",
      subject: "Địa lý",
      room: "A2-203",
      type: "class",
    },
    {
      id: "10A2-t4-2",
      day: "T4",
      time: "09:00-10:30",
      subject: "Giáo dục công dân",
      room: "A2-203",
      type: "class",
    },
    {
      id: "10A2-t5-1",
      day: "T5",
      time: "13:30-15:00",
      subject: "Hóa học",
      room: "A2-305",
      type: "class",
    },
    {
      id: "10A2-t6-1",
      day: "T6",
      time: "07:15-08:45",
      subject: "Tiếng Anh",
      room: "A2-204",
      type: "class",
    },
  ],
  "12B1": [
    {
      id: "12B1-t2-1",
      day: "T2",
      time: "07:15-08:45",
      subject: "Toán",
      room: "B1-201",
      type: "class",
    },
    {
      id: "12B1-t2-2",
      day: "T2",
      time: "09:00-10:30",
      subject: "Ngữ văn",
      room: "B1-201",
      type: "class",
    },
    {
      id: "12B1-t3-1",
      day: "T3",
      time: "07:15-08:45",
      subject: "Vật lý",
      room: "B1-202",
      type: "class",
    },
    {
      id: "12B1-t4-1",
      day: "T4",
      time: "09:00-10:30",
      subject: "Hóa học",
      room: "B1-203",
      type: "class",
    },
    {
      id: "12B1-t5-1",
      day: "T5",
      time: "07:15-08:45",
      subject: "Tiếng Anh",
      room: "B1-204",
      type: "class",
    },
    {
      id: "12B1-t6-1",
      day: "T6",
      time: "13:30-15:00",
      subject: "Lịch sử",
      room: "B1-305",
      type: "class",
    },
  ],
};

export const extraSubjectSchedules: Record<string, ScheduleEntry[]> = {
  "Toán ôn TN": [
    {
      id: "extra-toan-t3-1",
      day: "T3",
      time: "18:30-20:00",
      subject: "Toán ôn TN",
      room: "Phòng Ôn 1",
      type: "extra",
    },
    {
      id: "extra-toan-t6-1",
      day: "T6",
      time: "18:30-20:00",
      subject: "Toán ôn TN",
      room: "Phòng Ôn 1",
      type: "extra",
    },
  ],
  "Ngữ văn ôn TN": [
    {
      id: "extra-van-t4-1",
      day: "T4",
      time: "18:30-20:00",
      subject: "Ngữ văn ôn TN",
      room: "Phòng Ôn 2",
      type: "extra",
    },
  ],
  "Tiếng Anh ôn TN": [
    {
      id: "extra-anh-t2-1",
      day: "T2",
      time: "18:30-20:00",
      subject: "Tiếng Anh ôn TN",
      room: "Phòng Ngoại ngữ",
      type: "extra",
    },
    {
      id: "extra-anh-t5-1",
      day: "T5",
      time: "18:30-20:00",
      subject: "Tiếng Anh ôn TN",
      room: "Phòng Ngoại ngữ",
      type: "extra",
    },
  ],
  "Vật lý ôn TN": [
    {
      id: "extra-ly-t7-1",
      day: "T7",
      time: "08:00-09:30",
      subject: "Vật lý ôn TN",
      room: "Phòng Ôn 3",
      type: "extra",
    },
  ],
};

export const extraSubjects = Object.keys(extraSubjectSchedules).sort((a, b) =>
  a.localeCompare(b, "vi"),
);
