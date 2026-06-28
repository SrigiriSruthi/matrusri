import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import TaskCard from "@/components/TaskCard";
import { TODAY_TASKS, AWAY_TODAY } from "@/data/seed";

const WARDEN_NAV = [
  { href: "/warden", icon: "📋", label: "Tasks" },
  { href: "/warden/outing-new", icon: "🚪", label: "New outing" },
  { href: "/warden/sick", icon: "🤒", label: "Sick" },
  { href: "/warden/laundry", icon: "🧺", label: "Laundry" },
  { href: "#me", icon: "👤", label: "Me" },
];

export default function WardenHome() {
  const done = TODAY_TASKS.filter((t) => t.status === "done").length;
  const open = TODAY_TASKS.filter((t) => t.status === "open").length;
  const missed = TODAY_TASKS.filter((t) => t.status === "missed").length;
  const upcoming = TODAY_TASKS.filter((t) => t.status === "upcoming").length;

  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader
        back="/"
        title="Today's Tasks"
        subtitle="Lakshmi · 28 Jun · 5:42 pm"
        rightSlot={<span className="opacity-50">🔔</span>}
      />

      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded-md mb-4">
          ✓ {done} done · 🟡 {open} open · 🔴 {missed} missed · {upcoming} upcoming · Total {TODAY_TASKS.length}
        </div>

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
          Today&apos;s tasks · in time order
        </div>

        {TODAY_TASKS.map((task) => {
          const href =
            task.name.startsWith("Attendance")
              ? "/warden/attendance"
              : task.name.startsWith("Laundry")
              ? "/warden/laundry"
              : task.proofType === "photo" || task.proofType === "tap"
              ? "/warden/task-action"
              : undefined;
          return <TaskCard key={task.id} task={task} href={href} />;
        })}

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mt-5 mb-2">
          Away today · {AWAY_TODAY.length} students
        </div>

        {AWAY_TODAY.map((o) => (
          <Link href="#" key={o.id} className="no-underline text-inherit">
            <div className="bg-white border border-slate-200 rounded-xl p-3 mb-2 flex items-center border-l-4 border-l-indigo-500">
              <div className="w-16 text-xs text-slate-500 font-semibold shrink-0">
                {o.startedAt}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">
                  {o.type === "sick_pickup" ? "🏥" : "⚠️"} {o.studentName} · Class {o.studentClass}
                  {o.type === "sick_pickup" ? " — sent home sick" : " — special outing"}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {o.reasonNote || o.reason}
                  {o.expectedReturn ? ` · Expected by ${o.expectedReturn}` : ""}
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full font-semibold uppercase ml-2 bg-blue-100 text-blue-800">
                Tap when back
              </span>
            </div>
          </Link>
        ))}
      </div>

      <BottomNav items={WARDEN_NAV} active="/warden" />
    </div>
  );
}
