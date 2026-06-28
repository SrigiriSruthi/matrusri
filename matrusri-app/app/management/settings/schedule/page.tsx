import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { getTaskTemplates, getAllUsers } from "@/lib/fetchers";
import { generateTodayInstances } from "@/lib/actions";
import ScheduleClient from "./ScheduleClient";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  await guardRole("management");
  const templates = await getTaskTemplates();
  const users = await getAllUsers();
  const wardens = users.filter((u) => u.role === "warden" && u.is_active);

  type T = {
    id: string;
    name: string;
    slot_time: string;
    window_start: string;
    window_end: string;
    proof_type: string;
    default_assignee_id: string | null;
    default_assignee: { id: string; name: string } | null;
  };
  type W = { id: string; name: string };

  return (
    <div className="min-h-screen">
      <PhoneHeader back="/management/settings" title="Daily schedule" subtitle={`${templates.length} tasks`} />

      <div className="p-4">
        <form action={generateTodayInstances}>
          <button type="submit" className="w-full bg-blue-800 text-white font-semibold py-3 rounded-lg mb-4">
            ⚙️ Generate today&apos;s tasks now
          </button>
        </form>
        <div className="text-[11px] text-slate-500 text-center mb-4">
          Creates one task instance per template for today, using the default warden below.
        </div>

        <ScheduleClient
          templates={(templates as unknown as T[]) ?? []}
          wardens={wardens.map<W>((w) => ({ id: w.id, name: w.name }))}
        />
      </div>
    </div>
  );
}
