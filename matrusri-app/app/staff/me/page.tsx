import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import { guardRole } from "@/lib/guard";

export const dynamic = "force-dynamic";

const STAFF_NAV = [
  { href: "/staff", icon: "✅", label: "Approvals" },
  { href: "/staff/history", icon: "📜", label: "History" },
  { href: "/staff/me", icon: "👤", label: "Me" },
];

export default async function StaffMe() {
  const me = await guardRole(["staff", "management"]);
  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader back="/staff" title="My profile" />

      <div className="p-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 flex items-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-2xl mr-3">
            👤
          </div>
          <div>
            <div className="font-bold text-lg">{me.name}</div>
            <div className="text-xs text-slate-500">Staff approver · @{me.username}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">3</div>
            <div className="text-[11px] text-slate-500">Approved today</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">21</div>
            <div className="text-[11px] text-slate-500">This week</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">2</div>
            <div className="text-[11px] text-slate-500">Pending now</div>
          </div>
        </div>

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
          Approval team
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 mb-4 text-sm space-y-2">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span>Suresh Kumar (you)</span>
            <span className="text-emerald-600 text-xs">Active</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span>Lakshmi Devi</span>
            <span className="text-emerald-600 text-xs">Active</span>
          </div>
          <div className="flex justify-between">
            <span>Priya Sharma</span>
            <span className="text-emerald-600 text-xs">Active</span>
          </div>
        </div>

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
          Settings
        </div>
        <Link href="#" className="bg-white border border-slate-200 rounded-xl p-3 mb-2 flex items-center no-underline text-inherit">
          <span className="text-xl mr-3">🔒</span>
          <div className="flex-1">
            <div className="text-sm font-semibold">Change PIN</div>
          </div>
          <span className="text-slate-400">›</span>
        </Link>
        <Link href="#" className="bg-white border border-slate-200 rounded-xl p-3 mb-2 flex items-center no-underline text-inherit">
          <span className="text-xl mr-3">🔔</span>
          <div className="flex-1">
            <div className="text-sm font-semibold">Notification preferences</div>
          </div>
          <span className="text-slate-400">›</span>
        </Link>

        <form action="/api/logout" method="POST" className="mt-4">
          <button
            type="submit"
            className="block w-full text-center bg-white text-red-600 font-semibold py-3 rounded-lg border border-red-200"
          >
            Sign out
          </button>
        </form>
      </div>

      <BottomNav items={STAFF_NAV} active="/staff/me" />
    </div>
  );
}
