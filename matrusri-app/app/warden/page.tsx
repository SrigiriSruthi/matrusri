import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import TaskCard from "@/components/TaskCard";
import { getWardenToday } from "@/lib/warden";
import { guardRole } from "@/lib/guard";
import { t } from "@/lib/i18n";
import { formatDateIST, formatTimeIST } from "@/lib/timezone";

export const dynamic = "force-dynamic";

const WARDEN_NAV = [
  { href: "/warden", icon: "📋", label: "Tasks" },
  { href: "/warden/outing-new", icon: "🚪", label: "New outing" },
  { href: "/warden/sick", icon: "🤒", label: "Sick" },
  { href: "/warden/laundry", icon: "🧺", label: "Laundry" },
  { href: "/warden/me", icon: "👤", label: "Me" },
];

function nowSubtitle() {
  const now = new Date();
  return `${formatDateIST(now)} · ${formatTimeIST(now)}`;
}

export default async function WardenHome() {
  const me = await guardRole("warden");
  const tasksRaw = await getWardenToday(me.id);
  // Translate task names to the user's language (icon was already set from English name)
  const tasks = tasksRaw.map((task) => ({
    ...task,
    name: t(task.name, me.language),
  }));

  const done = tasks.filter((t) => t.status === "done").length;
  const open = tasks.filter((t) => t.status === "open").length;
  const missed = tasks.filter((t) => t.status === "missed").length;
  const upcoming = tasks.filter((t) => t.status === "upcoming").length;

  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader
        back="/"
        title="Today's Tasks"
        subtitle={`${me.name} · ${nowSubtitle()}`}
        rightSlot={<span className="opacity-50">🔔</span>}
      />

      <div className="p-4">
        {tasks.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm text-amber-800 mb-4">
            <strong>No tasks assigned to you for today yet.</strong>
            <br />
            <span className="text-xs">
              Ask management to generate today&apos;s tasks from Settings → Schedule.
            </span>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded mb-4">
            ✓ {done} done · 🟡 {open} open · 🔴 {missed} missed · {upcoming} upcoming · Total {tasks.length}
          </div>
        )}

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
          Today&apos;s tasks · in time order
        </div>

        {tasks.map((task) => {
          const href =
            task.name.startsWith("Attendance")
              ? `/warden/attendance/${task.id}`
              : task.name.startsWith("Laundry")
              ? "/warden/laundry"
              : task.proofType === "photo" || task.proofType === "tap"
              ? `/warden/task-action/${task.id}`
              : undefined;
          return <TaskCard key={task.id} task={task} href={href} lang={me.language} />;
        })}
      </div>

      <BottomNav items={WARDEN_NAV} active="/warden" />
    </div>
  );
}
