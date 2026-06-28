/**
 * Ensures today's task_instances exist.
 *
 * Called by every page that needs to read today's tasks.
 * If instances already exist for today, no-op (cheap query).
 * Otherwise, creates one per active template.
 *
 * Status starts as 'pending'. Each page that reads instances uses time-of-day
 * to decide whether the warden should see 'pending' / 'open' / 'missed'.
 */
import { serviceClient } from "./supabase";
import { todayIST } from "./timezone";

let lastChecked: { date: string; checkedAt: number } | null = null;
const CACHE_MS = 60 * 1000; // recheck at most every 60 seconds

export async function ensureTodayInstances(): Promise<void> {
  const today = todayIST();

  // Short-circuit: we already confirmed today's instances exist within the last 60 sec
  if (lastChecked && lastChecked.date === today && Date.now() - lastChecked.checkedAt < CACHE_MS) {
    return;
  }

  const sb = serviceClient();

  // Check if any instance exists for today
  const { data: existing, error: checkErr } = await sb
    .from("task_instances")
    .select("id", { head: false })
    .eq("date", today)
    .limit(1);

  if (checkErr) {
    // Don't crash the page; just log
    console.error("ensureTodayInstances check failed:", checkErr.message);
    return;
  }

  if (existing && existing.length > 0) {
    lastChecked = { date: today, checkedAt: Date.now() };
    return;
  }

  // Fetch active templates
  const { data: templates, error: tErr } = await sb
    .from("task_templates")
    .select("id, default_assignee_id")
    .eq("is_active", true)
    .order("sort_order");

  if (tErr || !templates || templates.length === 0) {
    console.error("ensureTodayInstances templates fetch failed or empty:", tErr?.message);
    return;
  }

  const rows = templates.map((t) => ({
    template_id: t.id,
    date: today,
    assigned_to: t.default_assignee_id,
    status: "pending" as const,
  }));

  const { error: insErr } = await sb.from("task_instances").insert(rows);
  if (insErr) {
    // Ignore unique-constraint errors (race condition — another request beat us to it)
    if (!String(insErr.code).includes("23505") && !String(insErr.message).includes("duplicate")) {
      console.error("ensureTodayInstances insert failed:", insErr.message);
    }
  }
  lastChecked = { date: today, checkedAt: Date.now() };
}
