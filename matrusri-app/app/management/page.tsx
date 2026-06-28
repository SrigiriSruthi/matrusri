import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import MgmtTabBar from "@/components/MgmtTabBar";
import { getDashboardSummary } from "@/lib/dashboard";
import { guardRole } from "@/lib/guard";
import { formatDateIST, formatTimeIST } from "@/lib/timezone";

export const dynamic = "force-dynamic";

const MGMT_NAV = [
  { href: "/management", icon: "📊", label: "Today" },
  { href: "/management/trends", icon: "📈", label: "Trends" },
  { href: "/management/wardens", icon: "👥", label: "Wardens" },
  { href: "/management/settings", icon: "⚙️", label: "Settings" },
];

function StatCard({
  label,
  value,
  subtitle,
  accent,
  subColor = "text-slate-400",
}: {
  label: string;
  value: string;
  subtitle?: string;
  accent: "green" | "blue" | "yellow" | "red";
  subColor?: string;
}) {
  const borderColor =
    accent === "green"
      ? "border-l-emerald-500"
      : accent === "blue"
      ? "border-l-blue-500"
      : accent === "yellow"
      ? "border-l-amber-500"
      : "border-l-red-500";
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-3 border-l-4 ${borderColor}`}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {subtitle && <div className={`text-[11px] font-semibold mt-1 ${subColor}`}>{subtitle}</div>}
    </div>
  );
}

function nowSubtitle(_d: string) {
  const now = new Date();
  return `${formatDateIST(now)} · ${formatTimeIST(now)}`;
}

export default async function ManagementToday() {
  await guardRole("management");
  const d = await getDashboardSummary();
  const s = d.studentState;
  const totalEnrolled = s.enrolledBoys + s.enrolledGirls;
  const accountedFor = s.presentBoys + s.presentGirls + s.onOuting + s.sickInHostel;

  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader
        back="/"
        title="Today"
        subtitle={`${d.hostelName} · ${nowSubtitle(d.date)}`}
        rightSlot={<span className="opacity-50">🔔</span>}
      />

      <MgmtTabBar active="/management" />

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link href="/management/today-tasks" className="no-underline text-inherit">
            <StatCard
              label="Tasks"
              value={`${d.tasksDone} of ${d.tasksDueSoFar}`}
              subtitle={d.tasksMissed > 0 ? `🔴 ${d.tasksMissed} missed` : "✓ on track"}
              subColor={d.tasksMissed > 0 ? "text-red-700" : "text-emerald-700"}
              accent={d.tasksMissed > 0 ? "red" : "green"}
            />
          </Link>
          <StatCard
            label="Attendance"
            value={`${d.attendanceDone} of ${d.attendanceDueSoFar}`}
            subtitle={d.attendanceDone >= d.attendanceDueSoFar ? "✓ on track" : `${d.attendanceDueSoFar - d.attendanceDone} due now`}
            subColor={d.attendanceDone >= d.attendanceDueSoFar ? "text-emerald-700" : "text-amber-700"}
            accent="blue"
          />
        </div>

        {/* Where is everyone — single block */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Where is everyone
            </div>
            {d.latestAttendance && (
              <div className="text-[11px] text-slate-400">
                As of Att #{d.latestAttendance.slot} · {d.latestAttendance.takenAt}
                {d.latestAttendance.verified && <span className="text-emerald-600 ml-1">✓</span>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="text-center">
              <div className="text-[11px] text-slate-500">Boys present</div>
              <div className="text-xl font-bold">
                {s.presentBoys}
                <span className="text-slate-400 text-sm">/{s.enrolledBoys}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-[11px] text-slate-500">Girls present</div>
              <div className="text-xl font-bold">
                {s.presentGirls}
                <span className="text-slate-400 text-sm">/{s.enrolledGirls}</span>
              </div>
            </div>
            <Link href="/warden/outing-return" className="text-center no-underline text-inherit">
              <div className="text-[11px] text-slate-500">On outing</div>
              <div className="text-xl font-bold text-blue-700">{s.onOuting}</div>
            </Link>
            <Link href="/warden/sick" className="text-center no-underline text-inherit">
              <div className="text-[11px] text-slate-500">Sick (in hostel)</div>
              <div className={`text-xl font-bold ${s.sickInHostel > 0 ? "text-amber-700" : "text-emerald-600"}`}>
                {s.sickInHostel}
              </div>
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-500 flex justify-between">
            <span>Total enrolled: {totalEnrolled}</span>
            <span>
              Accounted for: {accountedFor}
              {s.missing > 0 && <span className="text-red-600 ml-1">· {s.missing} missing</span>}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 text-center">
            Sick = resting in hostel. Sent-home and at-doctor are counted in &ldquo;On outing.&rdquo;
          </div>
        </div>

        {/* Laundry issues card — always shown */}
        <Link href="/warden/laundry" className="block no-underline text-inherit mb-4">
          <div
            className={`bg-white border border-slate-200 rounded-xl p-3 flex items-center border-l-4 ${
              d.laundryIssues > 0 ? "border-l-amber-500" : "border-l-emerald-500"
            }`}
          >
            <div className="text-2xl mr-3">🧺</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500">Laundry issues</div>
              <div className={`text-lg font-bold ${d.laundryIssues > 0 ? "text-amber-700" : "text-emerald-600"}`}>
                {d.laundryIssues === 0 ? "All clear" : `${d.laundryIssues} open`}
              </div>
            </div>
            <span className="text-slate-400 ml-2">›</span>
          </div>
        </Link>

        <div className="flex justify-between items-center mt-2 mb-3">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-500">
            Needs attention ({d.alerts.length})
          </div>
          <Link href="/management/activity" className="text-xs text-blue-800 underline">
            Activity log →
          </Link>
        </div>

        {d.alerts.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg p-3 text-center">
            ✓ All clear — nothing needs your attention right now
          </div>
        ) : (
          d.alerts.map((a) => (
            <div
              key={a.id}
              className={`flex items-center bg-red-50 border border-slate-200 border-l-4 ${
                a.severity === "red" ? "border-l-red-500" : "border-l-amber-500"
              } rounded-lg p-3 mb-2`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full mr-3 shrink-0 ${
                  a.severity === "red" ? "bg-red-500" : "bg-amber-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{a.title}</div>
                <div className="text-xs text-slate-500 truncate">{a.meta}</div>
              </div>
              <div className="text-xs text-slate-500 ml-2 shrink-0">{a.time}</div>
            </div>
          ))
        )}

        <div className="text-[11px] text-slate-400 mt-4 text-center">
          ✅ Live from Supabase
        </div>
      </div>

      <BottomNav items={MGMT_NAV} active="/management" />
    </div>
  );
}
