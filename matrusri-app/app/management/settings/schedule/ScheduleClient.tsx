"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { reassignTaskTemplate } from "@/lib/actions";

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

function formatHHMM(t: string) {
  if (!t) return "";
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr);
  const m = parseInt(mStr);
  const a = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${a}`;
}

export default function ScheduleClient({ templates, wardens }: { templates: T[]; wardens: W[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleReassign(templateId: string, newId: string) {
    setBusyId(templateId);
    setError(null);
    try {
      await reassignTaskTemplate(templateId, newId || null);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
        Templates (in time order)
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded p-2 mb-3">
          {error}
        </div>
      )}

      {templates.map((t) => (
        <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-3 mb-2">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{t.name}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {formatHHMM(t.slot_time)} · window {formatHHMM(t.window_start)}–
                {formatHHMM(t.window_end)} · {t.proof_type}
              </div>
            </div>
            <Link
              href={`/management/settings/schedule/${t.id}`}
              className="text-xs text-blue-700 underline ml-2 shrink-0"
            >
              Edit
            </Link>
          </div>

          <label className="block text-[11px] text-slate-500 mb-1">Assigned warden</label>
          <select
            value={t.default_assignee_id ?? ""}
            onChange={(e) => handleReassign(t.id, e.target.value)}
            disabled={busyId === t.id}
            className="w-full border border-slate-300 rounded p-2 text-sm bg-white"
          >
            <option value="">— unassigned —</option>
            {wardens.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          {busyId === t.id && (
            <div className="text-[11px] text-slate-500 mt-1">Saving…</div>
          )}
        </div>
      ))}

      <div className="text-[11px] text-slate-400 text-center mt-3">
        Available wardens: {wardens.length === 0 ? "none — add wardens in Users" : wardens.map((w) => w.name).join(", ")}
      </div>
    </div>
  );
}
