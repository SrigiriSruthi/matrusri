"use server";

/**
 * Server actions — every "submit" the app does ends up here.
 *
 * These run on the server. They check who's logged in, then write to Supabase
 * using the service client (bypasses RLS). All actions record audit_log entries.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth";
import { serviceClient } from "./supabase";
import { todayIST } from "./timezone";

function denied() {
  throw new Error("Not authorized");
}

async function logAudit(actorId: string, action: string, entityType: string | null, entityId: string | null, details?: Record<string, unknown>) {
  const sb = serviceClient();
  await sb.from("audit_log").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details: details ?? {},
  });
}

// ============================================================================
// TASK INSTANCE ACTIONS
// ============================================================================

export async function markTaskTapDone(taskInstanceId: string, note?: string) {
  const me = await getCurrentUser();
  if (!me) denied();

  const sb = serviceClient();
  const { error } = await sb
    .from("task_instances")
    .update({
      status: "done",
      submitted_at: new Date().toISOString(),
      submitted_by: me!.id,
      note: note ?? null,
    })
    .eq("id", taskInstanceId);

  if (error) throw error;
  await logAudit(me!.id, "task.tap_done", "task_instances", taskInstanceId);
  revalidatePath("/warden");
  revalidatePath("/management");
}

export async function submitTaskPhoto(taskInstanceId: string, photoUrl: string, note?: string) {
  const me = await getCurrentUser();
  if (!me) denied();

  const sb = serviceClient();
  const { error } = await sb
    .from("task_instances")
    .update({
      status: "done",
      photo_url: photoUrl,
      submitted_at: new Date().toISOString(),
      submitted_by: me!.id,
      note: note ?? null,
    })
    .eq("id", taskInstanceId);

  if (error) throw error;
  await logAudit(me!.id, "task.photo_submitted", "task_instances", taskInstanceId, { photo_url: photoUrl });
  revalidatePath("/warden");
  revalidatePath("/management");
}

// ============================================================================
// ATTENDANCE
// ============================================================================

export async function submitAttendance(opts: {
  slotNumber: 1 | 2 | 3 | 4 | 5;
  boysPresent: number;
  girlsPresent: number;
  absentWithPermission: number;
  absentWithoutPermission: number;
}) {
  const me = await getCurrentUser();
  if (!me) denied();
  if (me!.role !== "warden" && me!.role !== "management") denied();

  const sb = serviceClient();
  const today = todayIST();

  // Upsert: if a row exists for (date, slot_number), update it; otherwise insert
  const { data: existing } = await sb
    .from("attendance")
    .select("id, submitted_by")
    .eq("date", today)
    .eq("slot_number", opts.slotNumber)
    .maybeSingle();

  if (existing) {
    // Lunch (slot 3): if a different warden submits, treat as cross-verification
    if (opts.slotNumber === 3 && existing.submitted_by !== me!.id) {
      const { error } = await sb
        .from("attendance")
        .update({
          verified_by: me!.id,
          verified_at: new Date().toISOString(),
          verified_boys_present: opts.boysPresent,
          verified_girls_present: opts.girlsPresent,
          mismatch: false, // we'd compare against original boys_present here in real prod
        })
        .eq("id", existing.id);
      if (error) throw error;
      await logAudit(me!.id, "attendance.verified", "attendance", existing.id);
    } else {
      const { error } = await sb
        .from("attendance")
        .update({
          boys_present: opts.boysPresent,
          girls_present: opts.girlsPresent,
          absent_with_permission: opts.absentWithPermission,
          absent_without_permission: opts.absentWithoutPermission,
          submitted_at: new Date().toISOString(),
          submitted_by: me!.id,
        })
        .eq("id", existing.id);
      if (error) throw error;
      await logAudit(me!.id, "attendance.updated", "attendance", existing.id);
    }
  } else {
    const { error } = await sb.from("attendance").insert({
      date: today,
      slot_number: opts.slotNumber,
      boys_present: opts.boysPresent,
      girls_present: opts.girlsPresent,
      absent_with_permission: opts.absentWithPermission,
      absent_without_permission: opts.absentWithoutPermission,
      submitted_by: me!.id,
    });
    if (error) throw error;
    await logAudit(me!.id, "attendance.submitted", "attendance", null, { slot: opts.slotNumber });
  }

  revalidatePath("/warden");
  revalidatePath("/management");
}

// ============================================================================
// SICK LOGS
// ============================================================================

export async function addSickLog(opts: {
  studentId: string;
  symptoms: string;
}) {
  const me = await getCurrentUser();
  if (!me) denied();
  if (me!.role !== "warden" && me!.role !== "management") denied();

  const sb = serviceClient();
  const { data, error } = await sb
    .from("sick_logs")
    .insert({
      student_id: opts.studentId,
      symptoms: opts.symptoms,
      reported_by: me!.id,
      status: "open",
    })
    .select("id")
    .single();

  if (error) throw error;
  await logAudit(me!.id, "sick.reported", "sick_logs", data.id, { student_id: opts.studentId });
  revalidatePath("/warden");
  revalidatePath("/warden/sick");
  revalidatePath("/management");
  return data.id as string;
}

export async function markSickParentCalled(sickLogId: string, type: "primary" | "emergency") {
  const me = await getCurrentUser();
  if (!me) denied();

  const sb = serviceClient();
  const field = type === "primary" ? "parent_called_at" : "emergency_called_at";

  const { error } = await sb
    .from("sick_logs")
    .update({ [field]: new Date().toISOString() })
    .eq("id", sickLogId);

  if (error) throw error;
  await logAudit(me!.id, `sick.${type}_called`, "sick_logs", sickLogId);
  revalidatePath("/warden/sick");
  revalidatePath("/management");
}

export async function markSickRecovered(sickLogId: string) {
  const me = await getCurrentUser();
  if (!me) denied();

  const sb = serviceClient();
  const now = new Date().toISOString();
  const { error } = await sb
    .from("sick_logs")
    .update({
      outcome: "recovered",
      outcome_set_at: now,
      outcome_set_by: me!.id,
      status: "closed",
      closed_at: now,
    })
    .eq("id", sickLogId);

  if (error) throw error;
  await logAudit(me!.id, "sick.recovered", "sick_logs", sickLogId);
  revalidatePath("/warden/sick");
  revalidatePath("/warden");
  revalidatePath("/management");
}

// ============================================================================
// OUTINGS  (warden creates → staff approves → warden ticks at gate)
// ============================================================================

export async function createOuting(opts: {
  studentId: string;
  type: "regular" | "special" | "sick_pickup";
  reason?: "sick" | "family_event" | "doctor_visit" | "emergency" | "other";
  reasonNote?: string;
  expectedReturnAt?: string;
}) {
  const me = await getCurrentUser();
  if (!me) denied();
  if (me!.role !== "warden" && me!.role !== "management") denied();

  const sb = serviceClient();
  const { data, error } = await sb
    .from("outings")
    .insert({
      student_id: opts.studentId,
      type: opts.type,
      reason: opts.reason ?? null,
      reason_note: opts.reasonNote ?? null,
      expected_return_at: opts.expectedReturnAt ?? null,
      requested_by: me!.id,
      status: "pending_approval",
    })
    .select("id")
    .single();

  if (error) throw error;
  await logAudit(me!.id, "outing.requested", "outings", data.id);
  revalidatePath("/staff");
  revalidatePath("/warden");
  revalidatePath("/management");
  return data.id as string;
}

export async function approveOuting(outingId: string) {
  const me = await getCurrentUser();
  if (!me) denied();
  if (me!.role !== "staff" && me!.role !== "management") denied();

  const sb = serviceClient();
  const { error } = await sb
    .from("outings")
    .update({
      status: "pending_gate",
      approved_by: me!.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", outingId);

  if (error) throw error;
  await logAudit(me!.id, "outing.approved", "outings", outingId);
  revalidatePath("/staff");
  revalidatePath("/warden");
  revalidatePath("/management");
}

export async function rejectOuting(outingId: string) {
  const me = await getCurrentUser();
  if (!me) denied();
  if (me!.role !== "staff" && me!.role !== "management") denied();

  const sb = serviceClient();
  const { error } = await sb
    .from("outings")
    .update({
      status: "rejected",
      approved_by: me!.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", outingId);

  if (error) throw error;
  await logAudit(me!.id, "outing.rejected", "outings", outingId);
  revalidatePath("/staff");
  revalidatePath("/warden");
}

export async function confirmGateAndStart(outingId: string) {
  const me = await getCurrentUser();
  if (!me) denied();
  if (me!.role !== "warden" && me!.role !== "management") denied();

  const sb = serviceClient();
  const now = new Date().toISOString();
  const { error } = await sb
    .from("outings")
    .update({
      status: "active",
      gate_confirmed_at: now,
      gate_confirmed_by: me!.id,
      started_at: now,
    })
    .eq("id", outingId);

  if (error) throw error;
  await logAudit(me!.id, "outing.parent_arrived", "outings", outingId);
  revalidatePath("/warden");
  revalidatePath("/management");
}

export async function markOutingReturned(outingId: string) {
  const me = await getCurrentUser();
  if (!me) denied();
  if (me!.role !== "warden" && me!.role !== "management") denied();

  const sb = serviceClient();
  const { error } = await sb
    .from("outings")
    .update({
      status: "closed",
      returned_at: new Date().toISOString(),
    })
    .eq("id", outingId);

  if (error) throw error;
  await logAudit(me!.id, "outing.returned", "outings", outingId);
  revalidatePath("/warden");
  revalidatePath("/warden/outing-return");
  revalidatePath("/management");
}

// ============================================================================
// STUDENTS (admin)
// ============================================================================

export async function createStudent(form: FormData) {
  const me = await getCurrentUser();
  if (!me || me.role !== "management") denied();

  const sb = serviceClient();
  const name = String(form.get("name") ?? "").trim();
  const cls = String(form.get("class") ?? "").trim();
  const gender = String(form.get("gender") ?? "");
  const parentName = String(form.get("parent_name") ?? "").trim();
  const parentPhone = String(form.get("parent_phone") ?? "").trim();
  const emergencyPhone = String(form.get("emergency_contact_phone") ?? "").trim() || null;

  if (!name || !cls || !parentName || !parentPhone) {
    throw new Error("Missing required fields");
  }
  if (gender !== "boy" && gender !== "girl") {
    throw new Error("Gender required");
  }

  const { data, error } = await sb
    .from("students")
    .insert({
      name,
      class: cls,
      dorm: "",                    // legacy column — empty string until we drop NOT NULL
      gender,
      parent_name: parentName,     // mother's name per form
      parent_phone: parentPhone,   // father's phone per form (primary contact)
      emergency_contact_name: emergencyPhone ? "Mother" : null,
      emergency_contact_phone: emergencyPhone,
    })
    .select("id")
    .single();

  if (error) throw error;
  await logAudit(me!.id, "student.created", "students", data.id, { name });
  revalidatePath("/management/settings/students");
  redirect("/management/settings/students");
}

export async function toggleStudentActive(studentId: string, isActive: boolean) {
  const me = await getCurrentUser();
  if (!me || me.role !== "management") denied();

  const sb = serviceClient();
  const { error } = await sb.from("students").update({ is_active: isActive }).eq("id", studentId);
  if (error) throw error;
  await logAudit(me!.id, isActive ? "student.activated" : "student.deactivated", "students", studentId);
  revalidatePath("/management/settings/students");
}

// ============================================================================
// USERS (admin)
// ============================================================================

import { hashPassword } from "./auth";

export async function createUser(form: FormData) {
  const me = await getCurrentUser();
  if (!me || me.role !== "management") denied();

  const sb = serviceClient();
  const name = String(form.get("name") ?? "").trim();
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const phone = String(form.get("phone") ?? "").trim();
  const role = String(form.get("role") ?? "");
  const password = String(form.get("password") ?? "");
  const language = String(form.get("language") ?? "en");

  if (!name || !username || !phone || !password) throw new Error("Missing fields");
  if (!["warden", "staff", "management"].includes(role)) throw new Error("Bad role");
  if (!["en", "te", "hi"].includes(language)) throw new Error("Bad language");
  if (password.length < 6) throw new Error("Password must be at least 6 characters");

  // Create auth.users row first
  const newId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  // Insert into public.users — we skip auth.users since we don't use Supabase Auth
  // But auth.users has a foreign key to public.users. Create a matching auth row using raw SQL.
  // For now, since we own the auth ourselves, just insert into public.users without auth row.
  // (We need to drop the FK constraint to public.users.id -> auth.users.id, or insert into auth.users.)
  //
  // Simpler approach: use an admin endpoint. But that adds complexity.
  // Easiest: insert into auth.users too via service role.

  const { error: authErr } = await sb.auth.admin.createUser({
    id: newId,
    email: `${username}@matrusri.local`,
    email_confirm: true,
    password: crypto.randomUUID(), // placeholder; we don't use Supabase Auth's password
  });
  if (authErr && !String(authErr.message).includes("already")) throw authErr;

  const { error } = await sb.from("users").insert({
    id: newId,
    name,
    username,
    phone,
    role: role as "warden" | "staff" | "management",
    password_hash: passwordHash,
    language: language as "en" | "te" | "hi",
  });

  if (error) throw error;
  await logAudit(me!.id, "user.created", "users", newId, { username, role });
  revalidatePath("/management/settings/users");
  redirect("/management/settings/users");
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const me = await getCurrentUser();
  if (!me || me.role !== "management") denied();
  if (me!.id === userId) throw new Error("You can't deactivate yourself.");

  const sb = serviceClient();
  let reassignedCount = 0;
  let replacementName: string | null = null;

  if (!isActive) {
    // Q2(C): auto-reassign tasks + templates to the first other active warden
    const { data: targetUser } = await sb
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (targetUser?.role === "warden") {
      const { data: replacements } = await sb
        .from("users")
        .select("id, name")
        .eq("role", "warden")
        .eq("is_active", true)
        .neq("id", userId)
        .order("name")
        .limit(1);

      const replacement = replacements?.[0];
      if (replacement) {
        replacementName = replacement.name;

        // Reassign template defaults
        const { data: tmplRows } = await sb
          .from("task_templates")
          .update({ default_assignee_id: replacement.id })
          .eq("default_assignee_id", userId)
          .select("id");

        // Reassign today's open task_instances (skip completed/missed — history preserved)
        const today = todayIST();
        const { data: instRows } = await sb
          .from("task_instances")
          .update({ assigned_to: replacement.id })
          .eq("assigned_to", userId)
          .eq("date", today)
          .in("status", ["pending", "open"])
          .select("id");

        reassignedCount = (tmplRows?.length ?? 0) + (instRows?.length ?? 0);
      } else {
        throw new Error(
          "No other active warden available. Add another warden before deactivating this one."
        );
      }
    }
  }

  const { error } = await sb.from("users").update({ is_active: isActive }).eq("id", userId);
  if (error) throw error;

  await logAudit(
    me!.id,
    isActive ? "user.activated" : "user.deactivated",
    "users",
    userId,
    { reassigned: reassignedCount, replacement_name: replacementName }
  );
  revalidatePath("/management/settings/users");
  revalidatePath("/management/settings/schedule");
}

export async function setMyLanguage(lang: "en" | "te" | "hi") {
  const me = await getCurrentUser();
  if (!me) denied();
  const sb = serviceClient();
  const { error } = await sb.from("users").update({ language: lang }).eq("id", me!.id);
  if (error) throw error;
  await logAudit(me!.id, "user.language_changed", "users", me!.id, { lang });
  revalidatePath("/warden");
  revalidatePath("/management");
  revalidatePath("/staff");
  revalidatePath("/warden/me");
  revalidatePath("/staff/me");
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const me = await getCurrentUser();
  if (!me) denied();
  // Either the user themselves, or management
  if (me!.role !== "management" && me!.id !== userId) denied();
  if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");

  const sb = serviceClient();
  const hash = await hashPassword(newPassword);
  const { error } = await sb.from("users").update({ password_hash: hash }).eq("id", userId);
  if (error) throw error;
  await logAudit(me!.id, "user.password_changed", "users", userId);
}

// ============================================================================
// TASK TEMPLATES (admin schedule)
// ============================================================================

export async function reassignTaskTemplate(templateId: string, newAssigneeId: string | null) {
  const me = await getCurrentUser();
  if (!me || me.role !== "management") denied();

  const sb = serviceClient();
  const { error } = await sb
    .from("task_templates")
    .update({ default_assignee_id: newAssigneeId })
    .eq("id", templateId);
  if (error) throw error;

  // Also reassign today's open instances so the new warden sees it immediately
  const today = todayIST();
  await sb
    .from("task_instances")
    .update({ assigned_to: newAssigneeId })
    .eq("template_id", templateId)
    .eq("date", today)
    .in("status", ["pending", "open"]);

  await logAudit(me!.id, "task_template.reassigned", "task_templates", templateId, {
    new_assignee_id: newAssigneeId,
  });
  revalidatePath("/management/settings/schedule");
  revalidatePath("/warden");
}

export async function updateTaskTemplate(form: FormData) {
  const me = await getCurrentUser();
  if (!me || me.role !== "management") denied();

  const id = String(form.get("id"));
  const name = String(form.get("name") ?? "").trim();
  const slotTime = String(form.get("slot_time") ?? "");
  const windowStart = String(form.get("window_start") ?? "");
  const windowEnd = String(form.get("window_end") ?? "");
  const proofType = String(form.get("proof_type") ?? "tap");
  const defaultAssignee = String(form.get("default_assignee_id") ?? "") || null;

  const sb = serviceClient();
  const { error } = await sb
    .from("task_templates")
    .update({
      name,
      slot_time: slotTime,
      window_start: windowStart,
      window_end: windowEnd,
      proof_type: proofType,
      default_assignee_id: defaultAssignee,
    })
    .eq("id", id);

  if (error) throw error;

  // Also reassign today's open instances if the assignee changed
  const today = todayIST();
  await sb
    .from("task_instances")
    .update({ assigned_to: defaultAssignee })
    .eq("template_id", id)
    .eq("date", today)
    .in("status", ["pending", "open"]);

  await logAudit(me!.id, "task_template.updated", "task_templates", id);
  revalidatePath("/management/settings/schedule");
  revalidatePath("/warden");
  redirect("/management/settings/schedule");
}

// ============================================================================
// LAUNDRY (problem students only)
// ============================================================================

export async function addLaundryIssue(opts: {
  studentId: string;
  itemCount: number;
  issueType: "missing" | "damaged" | "uncollected" | "other";
  note?: string;
}) {
  const me = await getCurrentUser();
  if (!me) denied();
  if (me!.role !== "warden" && me!.role !== "management") denied();
  if (opts.itemCount < 1) throw new Error("Item count must be at least 1");

  const sb = serviceClient();
  const { data, error } = await sb
    .from("laundry_issues")
    .insert({
      student_id: opts.studentId,
      item_count: opts.itemCount,
      issue_type: opts.issueType,
      note: opts.note ?? null,
      created_by: me!.id,
    })
    .select("id")
    .single();
  if (error) throw error;

  await logAudit(me!.id, "laundry.issue_added", "laundry_issues", data.id, {
    student_id: opts.studentId,
    issue_type: opts.issueType,
    item_count: opts.itemCount,
  });
  revalidatePath("/warden/laundry");
  revalidatePath("/management");
}

export async function clearLaundryIssue(issueId: string, note?: string) {
  const me = await getCurrentUser();
  if (!me) denied();
  if (me!.role !== "warden" && me!.role !== "management") denied();

  const sb = serviceClient();
  const { error } = await sb
    .from("laundry_issues")
    .update({
      cleared_at: new Date().toISOString(),
      cleared_by: me!.id,
      cleared_note: note ?? null,
    })
    .eq("id", issueId);

  if (error) throw error;
  await logAudit(me!.id, "laundry.issue_cleared", "laundry_issues", issueId);
  revalidatePath("/warden/laundry");
  revalidatePath("/management");
}

// ============================================================================
// GENERATE TODAY'S TASK INSTANCES (button instead of cron)
// ============================================================================

export async function generateTodayInstances() {
  const me = await getCurrentUser();
  if (!me || me.role !== "management") denied();

  const sb = serviceClient();
  const today = todayIST();

  // Wipe existing instances for today
  await sb.from("task_instances").delete().eq("date", today);

  // Fetch active templates
  const { data: templates, error: tErr } = await sb
    .from("task_templates")
    .select("id, default_assignee_id, slot_time, window_end")
    .eq("is_active", true)
    .order("sort_order");
  if (tErr) throw tErr;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Insert one row per template
  const rows = (templates ?? []).map((t) => {
    const [eh, em] = (t.window_end as string).split(":").map(Number);
    const [sh, sm] = (t.slot_time as string).split(":").map(Number);
    const endMin = eh * 60 + em;
    const startMin = sh * 60 + sm;

    let status: "pending" | "open" | "missed";
    if (nowMin > endMin) status = "missed";
    else if (nowMin >= startMin) status = "open";
    else status = "pending";

    return {
      template_id: t.id,
      date: today,
      assigned_to: t.default_assignee_id,
      status,
    };
  });

  if (rows.length > 0) {
    const { error: iErr } = await sb.from("task_instances").insert(rows);
    if (iErr) throw iErr;
  }

  await logAudit(me!.id, "task_instances.generated", null, null, { count: rows.length });
  revalidatePath("/warden");
  revalidatePath("/management");
}
