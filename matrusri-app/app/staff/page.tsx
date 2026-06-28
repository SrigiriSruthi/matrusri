import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import { PENDING_APPROVALS } from "@/data/seed";

const STAFF_NAV = [
  { href: "/staff", icon: "✅", label: "Approvals" },
  { href: "/staff/history", icon: "📜", label: "History" },
  { href: "/staff/me", icon: "👤", label: "Me" },
];

const REASON_CHIPS = [
  { id: "sick", label: "🤒 Sick" },
  { id: "family", label: "👨‍👩‍👧 Family event" },
  { id: "doctor", label: "🏥 Doctor visit" },
  { id: "emergency", label: "🚨 Emergency" },
  { id: "other", label: "📝 Other" },
];

export default function StaffApproval() {
  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader
        back="/"
        title="Outing Requests"
        subtitle="Suresh · Staff approver"
      />

      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex gap-2 text-xs">
        <span className="bg-amber-500 text-white px-3 py-1 rounded-full">Pending ({PENDING_APPROVALS.length})</span>
        <span className="bg-white border border-slate-300 px-3 py-1 rounded-full text-slate-700">Today</span>
        <span className="bg-white border border-slate-300 px-3 py-1 rounded-full text-slate-700">History</span>
      </div>

      <div className="p-4">
        {PENDING_APPROVALS.map((req) => (
          <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
            <div className="font-bold text-base">{req.student}</div>
            <div className="text-xs text-slate-500 mt-1">{req.parent}</div>
            <div className="text-xs text-slate-500 mt-1">
              ⏰ At gate {req.timeAtGate} · {req.minutesAgo} min ago
            </div>

            {req.otpVerified ? (
              <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded p-2 text-xs text-emerald-800">
                ✓ Parent OTP verified · {req.otpVerifiedAt}
              </div>
            ) : (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
                ⏳ OTP sent, waiting for parent
              </div>
            )}

            {req.specialDay && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
                ⚠️ Special-day request · Today is Wednesday (not 2nd Saturday)
              </div>
            )}

            {req.otpVerified && req.specialDay && (
              <>
                <div className="text-xs font-semibold mt-3 mb-2">Pick reason (required):</div>
                <div className="flex flex-wrap gap-2">
                  {REASON_CHIPS.map((c) => {
                    const picked = c.label.includes(req.reasonPicked || "");
                    return (
                      <span
                        key={c.id}
                        className={`px-3 py-1.5 rounded-full text-xs border ${
                          picked
                            ? "bg-blue-800 text-white border-blue-800"
                            : "bg-slate-100 text-slate-700 border-slate-300"
                        }`}
                      >
                        {c.label} {picked ? "✓" : ""}
                      </span>
                    );
                  })}
                </div>
                {req.note && (
                  <div className="mt-3 bg-slate-50 border border-slate-200 rounded p-2 text-xs">
                    <span className="text-slate-500">Note:</span> {req.note}
                  </div>
                )}
              </>
            )}

            <div className="flex gap-2 mt-4">
              {req.otpVerified ? (
                <button className="flex-1 bg-emerald-600 text-white font-semibold py-3 rounded-lg text-sm">
                  ✓ Approve
                </button>
              ) : (
                <button disabled className="flex-1 bg-slate-200 text-slate-500 font-semibold py-3 rounded-lg text-sm">
                  ✓ OTP needed first
                </button>
              )}
              <button className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-lg text-sm">
                ✗ Reject
              </button>
            </div>

            {req.approverCount && (
              <div className="text-[11px] text-slate-500 text-center mt-2">
                Any one of {req.approverCount} staff can approve. {req.approvers} are configured.
              </div>
            )}
          </div>
        ))}

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mt-4 mb-2">
          Today&apos;s released
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 opacity-75">
          <div className="font-semibold text-sm">Anil Kumar · Class 7</div>
          <div className="text-xs text-slate-500">✓ Approved by you · 4:12 pm · Returned 5:40 pm</div>
        </div>
      </div>

      <BottomNav items={STAFF_NAV} active="/staff" />
    </div>
  );
}
