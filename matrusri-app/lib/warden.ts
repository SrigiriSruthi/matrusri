/**
 * Warden-side data fetchers
 */
import { serviceClient } from "./supabase";
import type { Task } from "./types";
import { iconForTask } from "./i18n";
import { todayIST, formatTimeIST } from "./timezone";
import { ensureTodayInstances } from "./ensureToday";

function formatSlotTime(t: string) {
  // "06:30:00" -> "6:30 am"
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr);
  const m = parseInt(mStr);
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatTime(iso: string | null) {
  if (!iso) return null;
  return formatTimeIST(iso);
}

function formatWindow(start: string, end: string) {
  return `${formatSlotTime(start)} – ${formatSlotTime(end)}`;
}

export async function getWardenToday(wardenId?: string): Promise<Task[]> {
  await ensureTodayInstances();
  const sb = serviceClient();
  const today = todayIST();

  let q = sb
    .from("task_instances")
    .select(
      "id, status, submitted_at, submitted_by, photo_url, count_data, note, template:task_templates(name, slot_time, window_start, window_end, proof_type), assigned:users!assigned_to(name)"
    )
    .eq("date", today);

  if (wardenId) q = q.eq("assigned_to", wardenId);

  const { data, error } = await q;
  if (error) throw error;

  type Row = {
    id: string;
    status: "pending" | "open" | "done" | "missed";
    submitted_at: string | null;
    photo_url: string | null;
    count_data: { boys_present?: number; girls_present?: number } | null;
    template: { name: string; slot_time: string; window_start: string; window_end: string; proof_type: string } | null;
    assigned: { name: string } | null;
  };
  const rows = (data as unknown as Row[]) ?? [];

  // Sort by slot_time
  rows.sort((a, b) => (a.template?.slot_time ?? "").localeCompare(b.template?.slot_time ?? ""));

  return rows.map((r): Task => {
    const t = r.template;
    const time = t ? formatSlotTime(t.slot_time) : "—";
    const name = t?.name ?? "Task";
    const submittedAt = formatTime(r.submitted_at);

    let meta = "";
    if (r.status === "done") {
      if (r.count_data?.boys_present !== undefined) {
        meta = `Boys ${r.count_data.boys_present}/85 · Girls ${r.count_data.girls_present}/65 · ${submittedAt}`;
      } else if (t?.proof_type === "photo") {
        meta = `Uploaded · ${submittedAt}`;
      } else {
        meta = `Tap done · ${submittedAt} · ${r.assigned?.name ?? ""}`;
      }
    } else if (r.status === "missed") {
      meta = `Window closed at ${formatSlotTime(t!.window_end)}`;
    } else if (r.status === "open") {
      meta = `Window: ${formatWindow(t!.window_start, t!.window_end)}`;
    } else {
      meta = formatWindow(t!.window_start, t!.window_end);
    }

    // Map "pending" -> "upcoming" for UI clarity
    const uiStatus = r.status === "pending" ? "upcoming" : r.status;

    return {
      id: r.id,
      time,
      name,
      meta,
      status: uiStatus,
      proofType: (t?.proof_type ?? "tap") as "photo" | "count" | "tap",
      assignedTo: r.assigned?.name ?? "",
      icon: iconForTask(name),
    };
  });
}

export async function getAwayToday() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("outings")
    .select("id, type, reason, reason_note, started_at, expected_return_at, approver:users!approved_by(name), student:students(name, class)")
    .eq("status", "active")
    .is("returned_at", null)
    .order("started_at", { ascending: false });
  if (error) throw error;

  type Row = {
    id: string;
    type: "regular" | "special" | "sick_pickup";
    reason: string | null;
    reason_note: string | null;
    started_at: string | null;
    expected_return_at: string | null;
    approver: { name: string } | null;
    student: { name: string; class: string } | null;
  };
  const rows = (data as unknown as Row[]) ?? [];
  return rows.map((r) => ({
    id: r.id,
    studentName: r.student?.name ?? "—",
    studentClass: r.student?.class ?? "—",
    type: r.type,
    reasonNote: r.reason_note ?? undefined,
    startedAt: formatTime(r.started_at) ?? "—",
    expectedReturn: formatTime(r.expected_return_at) ?? undefined,
    approvedBy: r.approver?.name ?? undefined,
  }));
}
