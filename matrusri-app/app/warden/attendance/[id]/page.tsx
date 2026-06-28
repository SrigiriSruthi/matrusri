import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { getTaskInstance, getActiveStudents, getActiveOutings } from "@/lib/fetchers";
import AttendanceClient from "./AttendanceClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// Map task name -> slot number
function slotForTaskName(name: string): 1 | 2 | 3 | 4 | 5 | null {
  if (name.startsWith("Attendance #1")) return 1;
  if (name.startsWith("Attendance #2")) return 2;
  if (name.startsWith("Attendance #3")) return 3;
  if (name.startsWith("Attendance #4")) return 4;
  if (name.startsWith("Attendance #5")) return 5;
  return null;
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

  type Inst = { template: { name: string; window_start: string; window_end: string } | null };
  const t = inst as unknown as Inst;
  const slot = slotForTaskName(t.template?.name ?? "");
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
