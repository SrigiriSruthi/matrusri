"use client";

import { useRouter } from "next/navigation";
import { approveOuting, rejectOuting } from "@/lib/actions";

type Row = {
  id: string;
  type: "regular" | "special" | "sick_pickup";
  reason: string | null;
  reason_note: string | null;
  created_at: string;
  expected_return_at: string | null;
  student: { name: string; class: string; dorm: string } | null;
  requester: { name: string } | null;
};

const TYPE_TAGS: Record<string, { label: string; cls: string }> = {
  regular: { label: "📅 Regular", cls: "bg-slate-100 text-slate-700" },
  special: { label: "⚠️ Special-day", cls: "bg-amber-100 text-amber-800" },
  sick_pickup: { label: "🏥 Sick pickup", cls: "bg-red-100 text-red-800" },
};

const REASON_LABELS: Record<string, string> = {
  sick: "🤒 Sick",
  family_event: "👨‍👩‍👧 Family event",
  doctor_visit: "🏥 Doctor visit",
  emergency: "🚨 Emergency",
  other: "📝 Other",
};

function minAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m ago`;
}

export default function StaffApprovalsClient({ pending }: { pending: Row[] }) {
  const router = useRouter();

  async function approve(id: string) {
    await approveOuting(id);
    router.refresh();
  }

  async function reject(id: string) {
    if (!confirm("Reject this outing? The warden will be told the parent cannot take the student.")) return;
    await rejectOuting(id);
    router.refresh();
  }

  if (pending.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg p-4 text-center">
        ✓ No pending approvals. You&apos;re all caught up.
      </div>
    );
  }

  return (
    <div>
      {pending.map((req) => {
        const tag = TYPE_TAGS[req.type];
        return (
          <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
            <div className="flex justify-between items-start mb-2">
              <div className="font-bold">
                {req.student?.name} · Class {req.student?.class} · Dorm {req.student?.dorm}
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${tag.cls}`}>{tag.label}</span>
            </div>
            <div className="text-xs text-slate-500">
              Requested by {req.requester?.name} · {minAgo(req.created_at)}
            </div>
            {req.reason && (
              <div className="mt-2 text-sm">
                <span className="font-semibold">Reason:</span> {REASON_LABELS[req.reason] ?? req.reason}
              </div>
            )}
            {req.reason_note && (
              <div className="text-xs text-slate-600 mt-1">&ldquo;{req.reason_note}&rdquo;</div>
            )}

            <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
              ℹ️ Approve to authorize. Warden will then confirm parent has arrived at the gate before student is released.
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => approve(req.id)}
                className="flex-1 bg-emerald-600 text-white font-semibold py-3 rounded-lg text-sm"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => reject(req.id)}
                className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-lg text-sm"
              >
                ✗ Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
