import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { getTaskTemplates, getAllUsers } from "@/lib/fetchers";
import { generateTodayInstances } from "@/lib/actions";

export const dynamic = "force-dynamic";

function formatHHMM(t: string) {
  if (!t) return "";
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr);
  const m = parseInt(mStr);
  const a = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${a}`;
}

export default async function SchedulePage() {
  await guardRole("management");
  const templates = await getTaskTemplates();
  const users = await getAllUsers();
  const wardens = users.filter((u) => u.role === "warden" && u.is_active);

  return (
    <div className="min-h-screen">
      <PhoneHeader back="/management/settings" title="Daily schedule" subtitle={`${templates.length} tasks`} />

      <div className="p-4">
        <form action={async () => { "use server"; await generateTodayInstances(); }}>
          <button type="submit" className="w-full bg-blue-800 text-white font-semibold py-3 rounded-lg mb-4">
            ⚙️ Generate today&apos;s tasks now
          </button>
        </form>
        <div className="text-[11px] text-slate-500 text-center mb-4">
          This creates one task instance for each template, for today, assigned to the default warden.
          Normally a 4 am cron would do this — for now it&apos;s manual.
        </div>

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
          Templates (in time order)
        </div>

        {templates.map((t) => {
          type T = {
            id: string;
            name: string;
            slot_time: string;
            window_start: string;
            window_end: string;
            proof_type: string;
            default_assignee: { name: string } | null;
          };
          const row = t as unknown as T;
          return (
            <div key={row.id} className="bg-white border border-slate-200 rounded-xl p-3 mb-2">
              <div className="font-semibold text-sm">{row.name}</div>
              <div className="text-xs text-slate-500 mt-1">
                {formatHHMM(row.slot_time)} · window {formatHHMM(row.window_start)}–{formatHHMM(row.window_end)} · proof: {row.proof_type}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Default: <strong>{row.default_assignee?.name ?? "unassigned"}</strong>
              </div>
            </div>
          );
        })}

        <div className="text-[11px] text-slate-400 text-center mt-3">
          Editing schedule UI: coming next. For now you can edit templates directly in Supabase.
          Available wardens: {wardens.map((w) => w.name).join(", ")}
        </div>
      </div>
    </div>
  );
}
