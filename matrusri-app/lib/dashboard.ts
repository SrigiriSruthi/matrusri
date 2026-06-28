/**
 * Aggregates used by the management Today dashboard.
 */
import { serviceClient } from "./supabase";

export type DashboardSummary = {
  hostelName: string;
  date: string;             // ISO date
  tasksDone: number;
  tasksDueSoFar: number;
  tasksMissed: number;
  tasksRemaining: number;
  attendanceDone: number;
  attendanceDueSoFar: number;
  attendanceRemaining: number;
  studentState: {
    enrolledBoys: number;
    enrolledGirls: number;
    presentBoys: number;
    presentGirls: number;
    onOuting: number;
    sickInHostel: number;
    missing: number;
  };
  latestAttendance: {
    slot: number;
    slotName: string;
    takenAt: string;
    verified: boolean;
  } | null;
  laundryIssues: number;
  alerts: Array<{
    id: string;
    severity: "red" | "yellow";
    title: string;
    meta: string;
    time: string;
  }>;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hrs}h ${rem}m`;
}

const SLOT_NAMES = ["", "Study hall", "School interval", "Lunch", "Afternoon", "Day close"];

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const sb = serviceClient();
  const today = new Date().toISOString().slice(0, 10);

  // Hostel config
  const { data: cfg } = await sb.from("config").select("hostel_name").single();

  // Student enrollment by gender
  const { data: students } = await sb
    .from("students")
    .select("gender, id")
    .eq("is_active", true);

  const enrolledBoys = students?.filter((s) => s.gender === "boy").length ?? 0;
  const enrolledGirls = students?.filter((s) => s.gender === "girl").length ?? 0;

  // Active outings (away from hostel)
  const { data: outings } = await sb
    .from("outings")
    .select("id")
    .eq("status", "active")
    .is("returned_at", null);
  const onOuting = outings?.length ?? 0;

  // Active sick logs (in-hostel)
  const { data: sick } = await sb
    .from("sick_logs")
    .select("id, outcome")
    .eq("status", "open");
  // In-hostel = resting or null outcome (just reported)
  const sickInHostel = sick?.filter((s) => s.outcome === "resting" || s.outcome === null).length ?? 0;

  // Latest attendance
  const { data: attRow } = await sb
    .from("attendance")
    .select("*")
    .eq("date", today)
    .order("slot_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const totalEnrolled = enrolledBoys + enrolledGirls;
  const presentBoys = attRow?.boys_present ?? enrolledBoys - onOuting;
  const presentGirls = attRow?.girls_present ?? enrolledGirls;
  const accountedFor = presentBoys + presentGirls + onOuting + sickInHostel;
  const missing = Math.max(0, totalEnrolled - accountedFor);

  // Today's task instances
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const { data: instances } = await sb
    .from("task_instances")
    .select("status, template:task_templates(name, slot_time)")
    .eq("date", today);

  type Inst = {
    status: string;
    template: { name: string; slot_time: string } | null;
  };
  const insts = (instances as unknown as Inst[]) ?? [];

  const totalTasks = insts.length;
  const tasksDone = insts.filter((t) => t.status === "done").length;
  const tasksMissed = insts.filter((t) => t.status === "missed").length;
  const tasksOpen = insts.filter((t) => t.status === "open").length;

  // tasksDueSoFar = templates whose slot_time <= now
  const tasksDueSoFar = insts.filter((t) => {
    if (!t.template?.slot_time) return false;
    const [hh, mm] = t.template.slot_time.split(":").map(Number);
    return hh * 60 + mm <= nowMin;
  }).length;
  const tasksRemaining = totalTasks - tasksDueSoFar;

  // Attendance slots done / due so far
  const { data: attAll } = await sb
    .from("attendance")
    .select("slot_number")
    .eq("date", today);
  const attendanceDone = attAll?.length ?? 0;

  // Approx: slots that "should be done by now" — based on typical slot times
  const SLOT_TIMES_MIN = [0, 6 * 60 + 30, 10 * 60, 14 * 60, 18 * 60, 21 * 60 + 30];
  let attendanceDueSoFar = 0;
  for (let i = 1; i <= 5; i++) {
    if (nowMin >= SLOT_TIMES_MIN[i]) attendanceDueSoFar++;
  }
  const attendanceRemaining = 5 - attendanceDueSoFar;

  // Laundry issues open count (graceful if table doesn't exist yet)
  let laundryIssues = 0;
  try {
    const { data: l } = await sb
      .from("laundry_issues")
      .select("id")
      .is("cleared_at", null);
    laundryIssues = l?.length ?? 0;
  } catch {
    laundryIssues = 0;
  }

  // Open alerts
  const { data: alertsRaw } = await sb
    .from("alerts")
    .select("*")
    .is("acknowledged_at", null)
    .order("created_at", { ascending: false });

  const alerts = (alertsRaw ?? []).map((a) => ({
    id: a.id,
    severity: a.severity as "red" | "yellow",
    title: a.title,
    meta: a.message ?? "",
    time: relativeTime(a.created_at),
  }));

  return {
    hostelName: cfg?.hostel_name ?? "Matrusri Hostel",
    date: today,
    tasksDone,
    tasksDueSoFar,
    tasksMissed,
    tasksRemaining,
    attendanceDone,
    attendanceDueSoFar,
    attendanceRemaining,
    studentState: {
      enrolledBoys,
      enrolledGirls,
      presentBoys,
      presentGirls,
      onOuting,
      sickInHostel,
      missing,
    },
    laundryIssues,
    latestAttendance: attRow
      ? {
          slot: attRow.slot_number,
          slotName: SLOT_NAMES[attRow.slot_number] || `Slot #${attRow.slot_number}`,
          takenAt: formatTime(attRow.submitted_at),
          verified: !!attRow.verified_at,
        }
      : null,
    alerts,
  };
}
