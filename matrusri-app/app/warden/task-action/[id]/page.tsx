import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { getTaskInstance } from "@/lib/fetchers";
import TaskActionClient from "./TaskActionClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TaskActionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await guardRole(["warden", "management"]);
  const { id } = await params;
  const inst = await getTaskInstance(id);
  if (!inst) notFound();

  type Inst = {
    id: string;
    status: string;
    photo_url: string | null;
    template: { name: string; slot_time: string; window_start: string; window_end: string; proof_type: string } | null;
  };
  const t = inst as unknown as Inst;

  return (
    <div className="min-h-screen">
      <PhoneHeader
        back="/warden"
        title={t.template?.name ?? "Task"}
        subtitle={t.template?.proof_type === "photo" ? "Photo proof" : "Tap to mark done"}
      />

      <div className="p-4">
        <TaskActionClient
          taskInstanceId={t.id}
          status={t.status}
          proofType={(t.template?.proof_type ?? "tap") as "photo" | "count" | "tap"}
          existingPhoto={t.photo_url}
          windowStart={t.template?.window_start ?? ""}
          windowEnd={t.template?.window_end ?? ""}
        />
      </div>
    </div>
  );
}
