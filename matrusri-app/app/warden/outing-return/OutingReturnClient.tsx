"use client";

import { useRouter } from "next/navigation";
import { confirmGateAndStart, markOutingReturned } from "@/lib/actions";

type OutingRow = {
  id: string;
  type: "regular" | "special" | "sick_pickup";
  reason_note: string | null;
  expected_return_at: string | null;
  started_at: string | null;
  approved_at: string | null;
  student: { name: string; class: string; dorm: string } | null;
  approver: { name: string } | null;
};

function formatTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const a = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${a}`;
}

function typeLabel(t: string) {
  if (t === "sick_pickup") return "🏥 Sent home sick";
  if (t === "special") return "⚠️ Special outing";
  return "📅 Regular outing";
}

export default function OutingReturnClient({ atGate, active }: { atGate: OutingRow[]; active: OutingRow[] }) {
  const router = useRouter();

  async function confirmGate(id: string) {
    await confirmGateAndStart(id);
    router.refresh();
  }

  async function markReturned(id: string, name?: string) {
    if (!confirm(`Mark ${name ?? "this student"} as returned?`)) return;
    await markOutingReturned(id);
    router.refresh();
  }

  return (
    <div>
      {atGate.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
            Approved · awaiting parent at gate ({atGate.length})
          </div>
          {atGate.map((o) => (
            <div
              key={o.id}
              className="bg-white border border-slate-200 border-l-4 border-l-amber-500 rounded-xl p-4 mb-3"
            >
              <div className="font-bold">
                {typeLabel(o.type)} · {o.student?.name} · Class {o.student?.class}
              </div>
              {o.reason_note && (
                <div className="text-xs text-slate-500 mt-1">&ldquo;{o.reason_note}&rdquo;</div>
              )}
              <div className="text-xs text-slate-500 mt-1">
                Approved by {o.approver?.name} at {formatTime(o.approved_at)}
              </div>
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
                ⏳ Waiting for parent. Tap below when parent arrives at the gate.
              </div>
              <button
                onClick={() => confirmGate(o.id)}
                className="w-full mt-3 bg-emerald-600 text-white font-semibold py-3 rounded-lg"
              >
                ✓ Parent arrived — release student
              </button>
            </div>
          ))}
        </>
      )}

      {active.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mt-5 mb-2">
            Out now ({active.length})
          </div>
          {active.map((o) => (
            <div
              key={o.id}
              className="bg-white border border-slate-200 border-l-4 border-l-indigo-500 rounded-xl p-4 mb-3"
            >
              <div className="font-bold">
                {typeLabel(o.type)} · {o.student?.name} · Class {o.student?.class}
              </div>
              {o.reason_note && (
                <div className="text-xs text-slate-500 mt-1">&ldquo;{o.reason_note}&rdquo;</div>
              )}
              <div className="text-xs text-slate-500 mt-1">
                Left at {formatTime(o.started_at)}
                {o.expected_return_at && <> · Expected by {formatTime(o.expected_return_at)}</>}
              </div>
              {o.approver && (
                <div className="text-xs text-slate-500 mt-1">
                  Approved by {o.approver.name}
                  {o.approved_at && <> at {formatTime(o.approved_at)}</>}
                </div>
              )}
              <button
                onClick={() => markReturned(o.id, o.student?.name)}
                className="w-full mt-3 bg-blue-800 text-white font-semibold py-3 rounded-lg"
              >
                ✓ Mark as returned
              </button>
            </div>
          ))}
        </>
      )}

      {atGate.length === 0 && active.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-sm text-slate-500">
          No outings right now. All students are in the hostel.
        </div>
      )}

      <div className="text-[11px] text-slate-400 text-center mt-4">
        ✅ Live from Supabase
      </div>
    </div>
  );
}
