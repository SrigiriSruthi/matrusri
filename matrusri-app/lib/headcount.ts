/**
 * System-derived headcount.
 *
 * "System" answer: given everything we've recorded (active outings, open sick
 * logs), who should be in the hostel right now? Live, no snapshot.
 *
 * Out-of-hostel signals:
 *   - outings.status = 'active'           → student is currently out
 *   - sick_logs.status = 'open' AND that student has an active sick_pickup
 *     outing                              → already covered by outings above
 *
 * Sick students with no active outing are considered IN the hostel (resting).
 */
import { serviceClient } from "./supabase";

export type SystemHeadcount = {
  enrolledBoys: number;
  enrolledGirls: number;
  boysOnOuting: number;
  girlsOnOuting: number;
  sickInHostel: number;        // open sick logs with no active outing
  systemBoys: number;          // enrolled - on-outing  (sick-in-hostel stays counted as present)
  systemGirls: number;
};

export async function getSystemHeadcount(): Promise<SystemHeadcount> {
  const sb = serviceClient();

  const { data: students } = await sb
    .from("students")
    .select("id, gender")
    .eq("is_active", true);

  const studentGender = new Map<string, "boy" | "girl">();
  let enrolledBoys = 0;
  let enrolledGirls = 0;
  for (const s of students ?? []) {
    studentGender.set(s.id, s.gender);
    if (s.gender === "boy") enrolledBoys++;
    else if (s.gender === "girl") enrolledGirls++;
  }

  const { data: activeOutings } = await sb
    .from("outings")
    .select("student_id")
    .eq("status", "active")
    .is("returned_at", null);

  const outingStudentIds = new Set<string>();
  let boysOnOuting = 0;
  let girlsOnOuting = 0;
  for (const o of activeOutings ?? []) {
    outingStudentIds.add(o.student_id);
    const g = studentGender.get(o.student_id);
    if (g === "boy") boysOnOuting++;
    else if (g === "girl") girlsOnOuting++;
  }

  const { data: openSick } = await sb
    .from("sick_logs")
    .select("student_id")
    .eq("status", "open");

  let sickInHostel = 0;
  for (const s of openSick ?? []) {
    if (!outingStudentIds.has(s.student_id)) sickInHostel++;
  }

  return {
    enrolledBoys,
    enrolledGirls,
    boysOnOuting,
    girlsOnOuting,
    sickInHostel,
    systemBoys: enrolledBoys - boysOnOuting,
    systemGirls: enrolledGirls - girlsOnOuting,
  };
}

/**
 * Earliest active attendance template slot_time for today, formatted as
 * "6:30am" — used as a "next count due at …" hint before slot 1 is submitted.
 */
export async function firstAttendanceSlotTime(): Promise<string | null> {
  const sb = serviceClient();
  const { data } = await sb
    .from("task_templates")
    .select("slot_time, name")
    .eq("proof_type", "count")
    .eq("is_active", true)
    .order("slot_time", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data?.slot_time) return null;
  const [hh, mm] = data.slot_time.split(":").map(Number);
  const h12 = hh % 12 || 12;
  const ampm = hh >= 12 ? "pm" : "am";
  return `${h12}:${mm.toString().padStart(2, "0")}${ampm}`;
}
