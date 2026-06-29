import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { getTaskInstance, getActiveStudents, getActiveOutings } from "@/lib/fetchers";
import { serviceClient } from "@/lib/supabase";
import AttendanceClient from "./AttendanceClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// Slot number = this template's rank among active count templates (by slot_time).
// Doesn't depend on template name, so renaming "Attendance #5" doesn't break routing.
async function slotForTemplate(templateId: string): Promise<1 | 2 | 3 | 4 | 5 | null> {
  const sb = serviceClient();
  const { data } = await sb
    .from("task_templates")
    .select("id, slot_time")
    .eq("proof_type", "count")
    .eq("is_active", true)
    .order("slot_time", { ascending: true });
  const idx = (data ?? []).findIndex((t) => t.id === templateId);
  if (idx < 0) return null;
  const slot = idx + 1;
  if (slot < 1 || slot > 5) return null;
  return slot as 1 | 2 | 3 | 4 | 5;
}

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await guardRole(["warden", "management"]);
  const { id } = await params;
  const inst = await getTaskInstance(id);
  if (!inst) notFound();

  type Inst = {
    template_id: string;
    template: { name: string; window_start: string; window_end: string; proof_type: string } | null;
  };
  const t = inst as unknown as Inst;
  if (t.template?.proof_type !== "count") notFound();
  const slot = await slotForTemplate(t.template_id);
  if (!slot) notFound();

  const students = await getActiveStudents();
  const boys = students.filter((s) => s.gender === "boy").length;
  const girls = students.filter((s) => s.gender === "girl").length;

  // On outing today = active outings
  const activeOutings = await getActiveOutings();
  const onOuting = activeOutings.length;

  return (
    <div className="min-h-screen">
      <PhoneHeader
        back="/warden"
        title={t.template?.name ?? "Attendance"}
        subtitle={`Slot #${slot}`}
      />

      <div className="p-4">
        <AttendanceClient
          taskInstanceId={id}
          slot={slot}
          enrolledBoys={boys}
          enrolledGirls={girls}
          onOuting={onOuting}
        />
      </div>
    </div>
  );
}
