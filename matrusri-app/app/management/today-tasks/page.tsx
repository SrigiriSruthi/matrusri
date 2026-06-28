import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { getTodayTaskInstances } from "@/lib/fetchers";
import { ensureTodayInstances } from "@/lib/ensureToday";
import TodayTasksClient, { type TaskRow } from "./TodayTasksClient";

export const dynamic = "force-dynamic";

export default async function TodayTasksPage() {
  await guardRole("management");
  await ensureTodayInstances();
  const rows = await getTodayTaskInstances();

  type SupabaseRow = {
    id: string;
    status: string;
    photo_url: string | null;
    count_data: { boys_present?: number; girls_present?: number; absent_with_permission?: number; absent_without_permission?: number } | null;
    submitted_at: string | null;
    submitted_by: string | null;
    template: { name: string; slot_time: string; window_start: string; window_end: string; proof_type: string } | null;
    assigned: { name: string } | null;
  };

  const tasks: TaskRow[] = (rows as unknown as SupabaseRow[]).map((r) => ({
    id: r.id,
    name: r.template?.name ?? "Task",
    slotTime: r.template?.slot_time ?? "",
    windowStart: r.template?.window_start ?? "",
    windowEnd: r.template?.window_end ?? "",
    proofType: (r.template?.proof_type ?? "tap") as "photo" | "count" | "tap",
    status: r.status as "pending" | "open" | "done" | "missed",
    photoUrl: r.photo_url,
    countData: r.count_data ?? null,
    submittedAt: r.submitted_at,
    assignedName: r.assigned?.name ?? null,
  }));

  return (
    <div className="min-h-screen pb-12">
      <PhoneHeader back="/management" title="Today's tasks" subtitle={`${tasks.length} tasks`} />
      <div className="p-4">
        <TodayTasksClient initialTasks={tasks} />
      </div>
    </div>
  );
}
