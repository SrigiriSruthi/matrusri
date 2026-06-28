import type { Task, Outing, SickLog, Alert, User, Student } from "@/lib/types";

export const HOSTEL_NAME = "Matrusri Hostel";

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Lakshmi Devi", phone: "+919876543210", role: "warden", language: "en" },
  { id: "u2", name: "Priya Sharma", phone: "+919876543211", role: "warden", language: "en" },
  { id: "u3", name: "Suresh Kumar", phone: "+919876543212", role: "staff", language: "en" },
  { id: "u4", name: "Rajesh Naidu", phone: "+919876543213", role: "management", language: "en" },
];

export const MOCK_STUDENTS: Student[] = [
  { id: "s1", name: "Ravi Kumar", rollNo: "0045", class: "8", dorm: "A", gender: "boy",
    parentName: "Sujatha", parentPhone: "+919810000001",
    emergencyContactName: "Uncle Ramesh", emergencyContactPhone: "+919810000002" },
  { id: "s2", name: "Sreeja Reddy", rollNo: "0089", class: "9", dorm: "B", gender: "girl",
    parentName: "Rajesh", parentPhone: "+919810000003",
    emergencyContactName: "Aunt Padma", emergencyContactPhone: "+919810000004" },
  { id: "s3", name: "Anusha", rollNo: "0034", class: "6", dorm: "B", gender: "girl",
    parentName: "Geetha", parentPhone: "+919810000005",
    emergencyContactName: "Grandfather Subbarao", emergencyContactPhone: "+919810000006" },
];

export const TODAY_TASKS: Task[] = [
  { id: "t1",  time: "5:00 am",  name: "Lights / fans / main switch OFF", meta: "Tap done · 5:08 am · Lakshmi", status: "done",     proofType: "tap",   assignedTo: "Lakshmi" },
  { id: "t2",  time: "5:00 am",  name: "Bore pump ON",                    meta: "Started 5:02 am · OFF expected 6:00 am",            status: "done",     proofType: "photo", assignedTo: "Lakshmi" },
  { id: "t3",  time: "5:30 am",  name: "Yoga photo",                      meta: "Uploaded · 5:40 am",                                status: "done",     proofType: "photo", assignedTo: "Suresh" },
  { id: "t4",  time: "6:30 am",  name: "Attendance #1 — Study hall",      meta: "Boys 83/85 · Girls 64/65 · 6:35 am",               status: "done",     proofType: "count", assignedTo: "Lakshmi" },
  { id: "t5",  time: "6:30 am",  name: "Room lock confirmation",          meta: "Tap done · 6:42 am · Lakshmi",                     status: "done",     proofType: "tap",   assignedTo: "Lakshmi" },
  { id: "t6",  time: "9:00 am",  name: "Breakfast wastage photo",         meta: "🟢 Low · 9:12 am",                                 status: "done",     proofType: "photo", assignedTo: "Priya"   },
  { id: "t7",  time: "10:00 am", name: "Attendance #2 — School interval", meta: "Submitted · 10:45 am",                              status: "done",     proofType: "count", assignedTo: "Priya"   },
  { id: "t8",  time: "2:00 pm",  name: "Attendance #3 — Lunch",           meta: "Verified by Priya · 2:15 pm",                       status: "done",     proofType: "count", assignedTo: "Lakshmi" },
  { id: "t9",  time: "2:00 pm",  name: "Lunch wastage photo",             meta: "🟡 Medium · 2:30 pm",                              status: "done",     proofType: "photo", assignedTo: "Priya"   },
  { id: "t10", time: "5:00 pm",  name: "Water pump OFF photo",            meta: "Window closed at 7:00 pm",                          status: "missed",   proofType: "photo", assignedTo: "Lakshmi" },
  { id: "t11", time: "5:00 pm",  name: "Sick check + snacks",             meta: "Window: 5:00 – 7:00 pm",                            status: "open",     proofType: "tap",   assignedTo: "Lakshmi" },
  { id: "t12", time: "6:00 pm",  name: "Attendance #4",                   meta: "Window: 6:00 – 8:00 pm",                            status: "open",     proofType: "count", assignedTo: "Priya"   },
  { id: "t13", time: "6:00 pm",  name: "Snacks wastage photo",            meta: "Window: 6:00 – 8:00 pm",                            status: "open",     proofType: "photo", assignedTo: "Priya"   },
  { id: "t14", time: "8:00 pm",  name: "Evening study hall",              meta: "8:00 – 9:00 pm",                                    status: "upcoming", proofType: "tap",   assignedTo: "Lakshmi" },
  { id: "t15", time: "9:00 pm",  name: "Dining + Learning hall clean",    meta: "9:00 – 11:00 pm · 2 photos",                       status: "upcoming", proofType: "photo", assignedTo: "Lakshmi" },
  { id: "t16", time: "9:00 pm",  name: "Laundry distribution",            meta: "9:00 – 9:30 pm · 142 items",                       status: "upcoming", proofType: "tap",   assignedTo: "Lakshmi" },
  { id: "t17", time: "9:30 pm",  name: "Attendance #5 — Day close",       meta: "9:30 – 11:00 pm",                                   status: "upcoming", proofType: "count", assignedTo: "Lakshmi" },
  { id: "t18", time: "9:30 pm",  name: "Dinner wastage photo",            meta: "9:30 – 11:30 pm",                                   status: "upcoming", proofType: "photo", assignedTo: "Lakshmi" },
];

export const AWAY_TODAY: Outing[] = [
  { id: "o1", studentName: "Ravi Kumar",  studentClass: "8", type: "sick_pickup", reason: "Sick", reasonNote: "Fever, headache",      startedAt: "6:32 pm", approvedBy: "Lakshmi" },
  { id: "o2", studentName: "Sreeja Reddy", studentClass: "9", type: "special",    reason: "Family event", reasonNote: "Father in town for lunch", startedAt: "6:38 pm", expectedReturn: "9:00 pm", approvedBy: "Suresh" },
];

export const ACTIVE_SICK: SickLog[] = [
  { id: "sk1", studentName: "Anusha",  studentClass: "6", symptoms: "Stomach ache",   reportedAt: "3:15 pm", parentCalledAt: "3:45 pm", outcome: "resting" },
  { id: "sk2", studentName: "Ravi",    studentClass: "8", symptoms: "Fever, headache", reportedAt: "4:30 pm" },
  { id: "sk3", studentName: "Kiran",   studentClass: "9", symptoms: "Cold",            reportedAt: "yesterday", parentCalledAt: "yesterday", outcome: "resting", daysActive: 2 },
];

export const ACTIVE_ALERTS: Alert[] = [
  { id: "a1", severity: "red", title: "🏥 Ravi (Class 8) — sent home sick",          meta: "Fever, headache · Approved by Lakshmi · 6:32 pm", time: "Sick pickup" },
  { id: "a2", severity: "red", title: "⚠️ Sreeja (Class 9) — special-day outing",    meta: "Family event · father in town for lunch · 6:38 pm", time: "Special" },
  { id: "a3", severity: "red", title: "Water pump OFF photo missing",                meta: "Warden: Lakshmi · Due 5:00 pm", time: "42 min" },
  { id: "a4", severity: "red", title: "Sick log — parent not called for Anusha",    meta: "Class 6 · Reported 4:30 pm", time: "1h 12m" },
];

export const SUMMARY = {
  tasksDone: 9,
  tasksDueSoFar: 13,
  tasksRemaining: 5,
  attendanceDone: 3,
  attendanceDueSoFar: 3,
  attendanceRemaining: 2,
  sickToday: 4,
  outingsToday: 2,
  outingsExceptional: 2,
};

export const LATEST_ATTENDANCE = {
  slot: 3,
  slotName: "Lunch",
  takenAt: "2:15 pm",
  verified: true,
  enrolledBoys: 85,
  enrolledGirls: 65,
  presentBoys: 82,
  presentGirls: 61,
  onOuting: 7,
  // computed: 150 - 82 - 61 - 7 = 0; we'll display missing properly below
};

// Live student state — derived. Sick is in-hostel only (resting + at doctor in hostel).
// "Sent home sick" students count as on outing, not sick.
export const STUDENT_STATE = {
  presentBoys: 82,
  presentGirls: 61,
  enrolledBoys: 85,
  enrolledGirls: 65,
  onOuting: 7,           // includes regular + special + sick-pickup outings
  sickInHostel: 2,       // resting in hostel only
  missing: 0,            // present + outing + sick = 150
};

export const PENDING_APPROVALS = [
  {
    id: "ap1",
    student: "Ravi Kumar · Class 8 · Dorm A",
    parent: "Mother: Sujatha · +91 98xxx xxxxx",
    timeAtGate: "6:32 pm",
    minutesAgo: 10,
    otpVerified: true,
    otpVerifiedAt: "6:30 pm",
    specialDay: true,
    reasonPicked: "Family event",
    note: "Father in town, family lunch",
    approverCount: 3,
    approvers: "Suresh, Lakshmi, Priya",
  },
  {
    id: "ap2",
    student: "Sreeja Reddy · Class 9 · Dorm B",
    parent: "Father: Rajesh · +91 97xxx xxxxx",
    timeAtGate: "6:38 pm",
    minutesAgo: 4,
    otpVerified: false,
    specialDay: true,
  },
];
