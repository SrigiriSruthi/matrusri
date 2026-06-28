import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";

const WARDEN_NAV = [
  { href: "/warden", icon: "📋", label: "Tasks" },
  { href: "/warden/outing-new", icon: "🚪", label: "New outing" },
  { href: "/warden/sick", icon: "🤒", label: "Sick" },
  { href: "/warden/laundry", icon: "🧺", label: "Laundry" },
  { href: "/warden/me", icon: "👤", label: "Me" },
];

export default function WardenMe() {
  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader back="/warden" title="My profile" />

      <div className="p-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 flex items-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-2xl mr-3">
            👤
          </div>
          <div>
            <div className="font-bold text-lg">Lakshmi Devi</div>
            <div className="text-xs text-slate-500">Warden · joined 12 May 2026</div>
            <div className="text-xs text-slate-500 mt-1">+91 98xxx xxxxx</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">100%</div>
            <div className="text-[11px] text-slate-500">Today</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">100%</div>
            <div className="text-[11px] text-slate-500">This week</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">97%</div>
            <div className="text-[11px] text-slate-500">This month</div>
          </div>
        </div>

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
          Recent activity
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 mb-2 text-sm space-y-2">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span>Bore pump ON</span>
            <span className="text-slate-500 text-xs">5:02 am</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span>Lights/fans OFF</span>
            <span className="text-slate-500 text-xs">5:08 am</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span>Attendance #1</span>
            <span className="text-slate-500 text-xs">6:35 am</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span>Room lock confirmed</span>
            <span className="text-slate-500 text-xs">6:42 am</span>
          </div>
          <div className="flex justify-between">
            <span>Attendance #3 verified</span>
            <span className="text-slate-500 text-xs">2:15 pm</span>
          </div>
        </div>

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mt-4 mb-2">
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
            <div className="text-[11px] text-slate-500">Push + WhatsApp</div>
          </div>
          <span className="text-slate-400">›</span>
        </Link>

        <Link
          href="/"
          className="block w-full text-center bg-white text-red-600 font-semibold py-3 mt-4 rounded-lg border border-red-200 no-underline"
        >
          Sign out
        </Link>
      </div>

      <BottomNav items={WARDEN_NAV} active="/warden/me" />
    </div>
  );
}
