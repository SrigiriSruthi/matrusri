import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import MgmtTabBar from "@/components/MgmtTabBar";
import { SUMMARY, ACTIVE_ALERTS, HOSTEL_NAME, LATEST_ATTENDANCE } from "@/data/seed";

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

export default function ManagementToday() {
  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader
        back="/"
        title="Today"
        subtitle={`${HOSTEL_NAME} · Sun 28 Jun · 5:42 pm`}
        rightSlot={<span className="opacity-50">🔔</span>}
      />

      <MgmtTabBar active="/management" />

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard
            label="Tasks"
            value={`${SUMMARY.tasksDone} of ${SUMMARY.tasksDueSoFar}`}
            subtitle="🔴 1 missed"
            subColor="text-red-700"
            accent="green"
          />
          <StatCard
            label="Attendance"
            value={`${SUMMARY.attendanceDone} of ${SUMMARY.attendanceDueSoFar}`}
            subtitle="✓ on track"
            subColor="text-emerald-700"
            accent="blue"
          />
          <StatCard
            label="Sick"
            value={`${SUMMARY.sickToday}`}
            subtitle="2 resting · 2 sent"
            subColor="text-amber-700"
            accent="yellow"
          />
          <StatCard
            label="Outings"
            value={`${SUMMARY.outingsToday}`}
            subtitle="⚠️ both exceptions"
            subColor="text-red-700"
            accent="red"
          />
        </div>

        {/* Present strength */}
        {(() => {
          const a = LATEST_ATTENDANCE;
          const totalEnrolled = a.enrolledBoys + a.enrolledGirls;
          const totalPresent = a.presentBoys + a.presentGirls;
          const missing = totalEnrolled - totalPresent - a.onOuting;
          return (
            <Link href="/warden/attendance" className="block no-underline text-inherit">
              <div className="bg-white border border-slate-200 rounded-xl p-3 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-xs text-slate-500">
                    Present strength · Attendance #{a.slot} ({a.slotName})
                    {a.verified && <span className="text-emerald-600 ml-1">✓ verified</span>}
                  </div>
                  <div className="text-[11px] text-slate-400">{a.takenAt}</div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="text-[11px] text-slate-500">Boys</div>
                    <div className="text-lg font-bold">
                      {a.presentBoys}<span className="text-slate-400 text-sm">/{a.enrolledBoys}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[11px] text-slate-500">Girls</div>
                    <div className="text-lg font-bold">
                      {a.presentGirls}<span className="text-slate-400 text-sm">/{a.enrolledGirls}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[11px] text-slate-500">On outing</div>
                    <div className="text-lg font-bold text-blue-700">{a.onOuting}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[11px] text-slate-500">Missing</div>
                    <div className={`text-lg font-bold ${missing > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {missing}
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 text-center mt-2">
                  Total enrolled: {totalEnrolled} · Total present: {totalPresent}
                </div>
              </div>
            </Link>
          );
        })()}

        <div className="flex justify-between items-center mt-2 mb-3">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-500">
            Needs attention ({ACTIVE_ALERTS.length})
          </div>
          <Link href="/management/activity" className="text-xs text-blue-800 underline">
            Activity log →
          </Link>
        </div>

        {ACTIVE_ALERTS.map((a) => (
          <div
            key={a.id}
            className="flex items-center bg-red-50 border border-slate-200 border-l-4 border-l-red-500 rounded-lg p-3 mb-2"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-3 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{a.title}</div>
              <div className="text-xs text-slate-500 truncate">{a.meta}</div>
            </div>
            <div className="text-xs text-slate-500 ml-2 shrink-0">{a.time}</div>
          </div>
        ))}

        <div className="text-[11px] text-slate-400 mt-4 text-center">
          Green completions live in the Activity log — keeps this view clean.
        </div>
      </div>

      <BottomNav items={MGMT_NAV} active="/management" />
    </div>
  );
}
