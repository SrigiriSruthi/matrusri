/**
 * Server-side fetchers — read data from Supabase for pages to render.
 */
import { serviceClient } from "./supabase";
import { todayIST } from "./timezone";

export async function getStudents() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("students")
    .select("*")
    .order("class")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getActiveStudents() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("students")
    .select("*")
    .eq("is_active", true)
    .order("class")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getAllUsers() {
  const sb = serviceClient();
  const { data, error } = await sb.from("users").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getTaskTemplates() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("task_templates")
    .select("*, default_assignee:users!default_assignee_id(id, name)")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getActiveSickLogs() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("sick_logs")
    .select(`
      *,
      student:students(name, class, parent_name, parent_phone,
        emergency_contact_name, emergency_contact_phone)
    `)
    .eq("status", "open")
    .order("reported_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getActiveOutings() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("outings")
    .select(`
      *,
      student:students(name, class),
      approver:users!approved_by(name),
      requester:users!requested_by(name)
    `)
    .in("status", ["active", "pending_gate"])
    .is("returned_at", null)
    .order("started_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPendingApprovals() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("outings")
    .select(`
      *,
      student:students(name, class, dorm),
      requester:users!requested_by(name)
    `)
    .eq("status", "pending_approval")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getOpenAlerts() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("alerts")
    .select("*")
    .is("acknowledged_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAuditLog(opts: { limit?: number; date?: string } = {}) {
  const sb = serviceClient();
  const limit = opts.limit ?? 100;
  let q = sb
    .from("audit_log")
    .select("*, actor:users!actor_id(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (opts.date) {
    // The date is an IST calendar date (YYYY-MM-DD). Convert to UTC bounds:
    // IST is UTC+5:30, so IST midnight = previous UTC 18:30.
    const [y, m, d] = opts.date.split("-").map(Number);
    const istStart = new Date(Date.UTC(y, m - 1, d, 0, 0, 0)).getTime() - 5.5 * 60 * 60 * 1000;
    const istEnd   = new Date(Date.UTC(y, m - 1, d, 23, 59, 59)).getTime() - 5.5 * 60 * 60 * 1000;
    q = q
      .gte("created_at", new Date(istStart).toISOString())
      .lte("created_at", new Date(istEnd).toISOString());
  }

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getTodayTaskInstances() {
  const sb = serviceClient();
  const today = todayIST();
  const { data, error } = await sb
    .from("task_instances")
    .select(`
      *,
      template:task_templates(name, slot_time, window_start, window_end, proof_type),
      assigned:users!assigned_to(name)
    `)
    .eq("date", today);
  if (error) throw error;
  // Sort by slot_time in JS since orderBy on joined column is tricky
  const rows = (data ?? []) as unknown as Array<{
    template: { slot_time: string } | null;
    [k: string]: unknown;
  }>;
  rows.sort((a, b) => (a.template?.slot_time ?? "").localeCompare(b.template?.slot_time ?? ""));
  return rows;
}

export async function getTaskInstance(id: string) {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("task_instances")
    .select(`
      *,
      template:task_templates(name, slot_time, window_start, window_end, proof_type),
      assigned:users!assigned_to(name)
    `)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getOpenLaundryIssues() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("laundry_issues")
    .select(`
      *,
      student:students(name, class, dorm),
      creator:users!created_by(name)
    `)
    .is("cleared_at", null)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export type InFlightOuting = {
  studentId: string;
  status: "pending_approval" | "pending_gate" | "active";
  expectedReturnAt: string | null;
};

export async function getInFlightOutingsByStudent(): Promise<Map<string, InFlightOuting>> {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("outings")
    .select("student_id, status, expected_return_at")
    .in("status", ["pending_approval", "pending_gate", "active"])
    .is("returned_at", null);
  if (error) throw error;

  const map = new Map<string, InFlightOuting>();
  for (const row of data ?? []) {
    const s = row.status as InFlightOuting["status"];
    map.set(row.student_id, {
      studentId: row.student_id,
      status: s,
      expectedReturnAt: row.expected_return_at,
    });
  }
  return map;
}

export async function getOuting(id: string) {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("outings")
    .select(`
      *,
      student:students(name, class, dorm, parent_name, parent_phone)
    `)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
