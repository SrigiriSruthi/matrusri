"use client";

import { useRouter } from "next/navigation";
import PhoneHeader from "@/components/PhoneHeader";
import { AWAY_TODAY } from "@/data/seed";

export default function OutingReturn() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <PhoneHeader back="/warden" title="Away today" subtitle={`${AWAY_TODAY.length} students out`} />

      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded mb-4">
          Tap a student when they return through the gate. One tap closes the outing.
        </div>

        {AWAY_TODAY.map((o) => (
          <div
            key={o.id}
            className="bg-white border border-slate-200 border-l-4 border-l-indigo-500 rounded-xl p-4 mb-3"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-bold">
                  {o.type === "sick_pickup" ? "🏥 " : "⚠️ "}
                  {o.studentName} · Class {o.studentClass}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {o.type === "sick_pickup" ? "Sent home sick" : "Special outing"}
                  {o.reasonNote && <> · {o.reasonNote}</>}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Left at {o.startedAt}
                  {o.expectedReturn && <> · Expected by {o.expectedReturn}</>}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Approved by {o.approvedBy}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                alert(`${o.studentName} marked as returned. Outing closed.`);
                router.push("/warden");
              }}
              className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg"
            >
              ✓ Mark as returned
            </button>
          </div>
        ))}

        <div className="text-[11px] text-slate-400 text-center mt-4">
          Late returns auto-flag to management after 30 min past expected time.
        </div>
      </div>
    </div>
  );
}
