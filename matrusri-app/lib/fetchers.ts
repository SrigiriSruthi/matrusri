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
    const start = `${opts.date}T00:00:00Z`;
    const end = `${opts.date}T23:59:59Z`;
    q = q.gte("created_at", start).lte("created_at", end);
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
