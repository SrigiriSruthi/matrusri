import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import MgmtTabBar from "@/components/MgmtTabBar";
import { guardRole } from "@/lib/guard";

const MGMT_NAV = [
  { href: "/management", icon: "📊", label: "Today" },
  { href: "/management/trends", icon: "📈", label: "Trends" },
  { href: "/management/wardens", icon: "👥", label: "Wardens" },
  { href: "/management/settings", icon: "⚙️", label: "Settings" },
];

const SECTIONS = [
  { icon: "🎓", title: "Students", desc: "Add, edit, deactivate", href: "/management/settings/students" },
  { icon: "👥", title: "Users (wardens, staff, management)", desc: "Manage roles + initial passwords", href: "/management/settings/users" },
  { icon: "🕒", title: "Daily schedule", desc: "View task templates · generate today's instances", href: "/management/settings/schedule" },
];

export default async function SettingsPage() {
  const me = await guardRole("management");
  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader back="/management" title="Settings" subtitle="Configure your hostel" />
      <MgmtTabBar active="/management/settings" />

      <div className="p-4">
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
          Logged in as {me.name} · Management
        </div>
        <form action="/api/logout" method="POST" className="mt-2">
          <button type="submit" className="block w-full text-center text-xs text-blue-700 underline">
            Sign out
          </button>
        </form>
      </div>

      <BottomNav items={MGMT_NAV} active="/management/settings" />
    </div>
  );
}
