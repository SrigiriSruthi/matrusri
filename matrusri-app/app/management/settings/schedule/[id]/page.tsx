import Link from "next/link";
import { notFound } from "next/navigation";
import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { serviceClient } from "@/lib/supabase";
import { getAllUsers } from "@/lib/fetchers";
import { updateTaskTemplate } from "@/lib/actions";

export const dynamic = "force-dynamic";

async function getTemplate(id: string) {
  const sb = serviceClient();
  const { data } = await sb
    .from("task_templates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await guardRole("management");
  const { id } = await params;
  const template = await getTemplate(id);
  if (!template) notFound();

  const users = await getAllUsers();
  const wardens = users.filter((u) => u.role === "warden" && u.is_active);

  return (
    <div className="min-h-screen">
      <PhoneHeader back="/management/settings/schedule" title="Edit task" subtitle={template.name} />

      <form action={updateTaskTemplate} className="p-4 space-y-3">
        <input type="hidden" name="id" value={template.id} />

        <div>
          <label className="block text-xs text-slate-500 mb-1">Task name</label>
          <input
            name="name"
            defaultValue={template.name}
            required
            className="w-full border border-slate-300 rounded p-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Scheduled time</label>
          <input
            name="slot_time"
            type="time"
            defaultValue={template.slot_time?.slice(0, 5)}
            required
            className="w-full border border-slate-300 rounded p-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Window starts</label>
            <input
              name="window_start"
              type="time"
              defaultValue={template.window_start?.slice(0, 5)}
              required
              className="w-full border border-slate-300 rounded p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Window ends</label>
            <input
              name="window_end"
              type="time"
              defaultValue={template.window_end?.slice(0, 5)}
              required
              className="w-full border border-slate-300 rounded p-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Proof type</label>
          <select
            name="proof_type"
            defaultValue={template.proof_type}
            className="w-full border border-slate-300 rounded p-2 text-sm bg-white"
          >
            <option value="tap">Tap done</option>
            <option value="photo">Photo upload</option>
            <option value="count">Count entry (attendance)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Default assignee</label>
          <select
            name="default_assignee_id"
            defaultValue={template.default_assignee_id ?? ""}
            className="w-full border border-slate-300 rounded p-2 text-sm bg-white"
          >
            <option value="">— unassigned —</option>
            {wardens.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-800 text-white font-semibold py-3 rounded-lg mt-2"
        >
          Save changes
        </button>
        <Link
          href="/management/settings/schedule"
          className="block text-center bg-white text-blue-800 font-semibold py-3 rounded-lg border border-blue-800 no-underline"
        >
          Cancel
        </Link>
      </form>
    </div>
  );
}
