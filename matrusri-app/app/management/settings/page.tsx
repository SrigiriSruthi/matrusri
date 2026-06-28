import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import MgmtTabBar from "@/components/MgmtTabBar";

const MGMT_NAV = [
  { href: "/management", icon: "📊", label: "Today" },
  { href: "/management/trends", icon: "📈", label: "Trends" },
  { href: "/management/wardens", icon: "👥", label: "Wardens" },
  { href: "/management/settings", icon: "⚙️", label: "Settings" },
];

const SECTIONS = [
  { icon: "🎓", title: "Students", desc: "Add, edit, deactivate", href: "/management/settings/students" },
  { icon: "👥", title: "Users (wardens, staff, management)", desc: "Manage roles and phones · 10 active", href: "#" },
  { icon: "✅", title: "Outing approvers", desc: "Currently: Suresh, Lakshmi, Priya", href: "#" },
  { icon: "🕒", title: "Daily schedule", desc: "16 tasks · time windows · per-warden assignment", href: "#" },
  { icon: "🚰", title: "Pump sessions", desc: "Bore pump: 5:00–6:00 am · ±15 min tolerance", href: "#" },
  { icon: "📆", title: "Holiday calendar", desc: "Sundays + festivals · Attendance #2 auto-skips", href: "#" },
  { icon: "🔔", title: "Notification preferences", desc: "Push only (WhatsApp pending setup)", href: "#" },
  { icon: "🗄", title: "Data retention", desc: "Photos: 30 days · Records: forever", href: "#" },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader back="/management" title="Settings" subtitle="Configure your hostel" />
      <MgmtTabBar active="/management/settings" />

      <div className="p-4">
        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800 mb-4">
          ⚠️ Settings pages are coming next — for now this lists what you&apos;ll be able to configure.
        </div>

        {SECTIONS.map((s, i) => (
          <Link
            key={i}
            href={s.href}
            className="bg-white border border-slate-200 rounded-xl p-3 mb-2 flex items-center no-underline text-inherit"
          >
            <div className="text-2xl mr-3">{s.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{s.title}</div>
              <div className="text-xs text-slate-500 truncate">{s.desc}</div>
            </div>
            <span className="text-slate-400 ml-2">›</span>
          </Link>
        ))}

        <div className="text-xs text-slate-400 text-center mt-6">
          Logged in as Rajesh Naidu · Management
        </div>
        <Link href="/" className="block text-center text-xs text-blue-700 underline mt-2">
          Sign out
        </Link>
      </div>

      <BottomNav items={MGMT_NAV} active="/management/settings" />
    </div>
  );
}
