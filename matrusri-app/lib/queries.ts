/**
 * Server-side query helpers — read from Supabase using the service client
 * for now (no auth wired yet). Once auth is in, we'll switch to serverClient()
 * so RLS applies.
 */
import { serviceClient } from "./supabase";

export async function getUsers() {
  const sb = serviceClient();
  const { data, error } = await sb.from("users").select("*").eq("is_active", true).order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getStudents() {
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

export async function getTaskTemplates() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("task_templates")
    .select("*, default_assignee:users!default_assignee_id(name)")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getTodayTaskInstances(date: string) {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("task_instances")
    .select("*, template:task_templates(name, slot_time, window_start, window_end, proof_type), assigned:users!assigned_to(name)")
    .eq("date", date)
    .order("template(slot_time)");
  if (error) throw error;
  return data ?? [];
}

export async function getActiveSickLogs() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("sick_logs")
    .select("*, student:students(name, class, parent_phone)")
    .eq("status", "open")
    .order("reported_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getActiveOutings() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("outings")
    .select("*, student:students(name, class), approver:users!approved_by(name)")
    .eq("status", "active")
    .is("returned_at", null)
    .order("started_at", { ascending: false });
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

export async function getLatestVerifiedAttendance() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("attendance")
    .select("*")
    .order("date", { ascending: false })
    .order("slot_number", { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function getStudentCountsByGender() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("students")
    .select("gender", { count: "exact" })
    .eq("is_active", true);
  if (error) throw error;
  let boys = 0;
  let girls = 0;
  for (const row of data ?? []) {
    if (row.gender === "boy") boys++;
    if (row.gender === "girl") girls++;
  }
  return { boys, girls, total: boys + girls };
}
