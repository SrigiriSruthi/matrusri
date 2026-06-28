import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import TaskCard from "@/components/TaskCard";
import { getWardenToday, getAwayToday } from "@/lib/warden";
import { guardRole } from "@/lib/guard";

export const dynamic = "force-dynamic";

const WARDEN_NAV = [
  { href: "/warden", icon: "📋", label: "Tasks" },
  { href: "/warden/outing-new", icon: "🚪", label: "New outing" },
  { href: "/warden/sick", icon: "🤒", label: "Sick" },
  { href: "/warden/laundry", icon: "🧺", label: "Laundry" },
  { href: "/warden/me", icon: "👤", label: "Me" },
];

function nowSubtitle() {
  const d = new Date();
  const day = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${day} · ${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default async function WardenHome() {
  const me = await guardRole("warden");
  // Show only tasks assigned to me. (Management can see everything via Wardens drill-in.)
  const tasks = await getWardenToday(me.id);
  const away = await getAwayToday();

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
            <strong>No tasks for today yet.</strong>
            <br />
            Run <code>db/04_today_demo.sql</code> in Supabase SQL Editor to seed today&apos;s state.
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
          return <TaskCard key={task.id} task={task} href={href} />;
        })}

        {away.length > 0 && (
          <>
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mt-5 mb-2">
              Away today · {away.length} students
            </div>

            {away.map((o) => (
              <Link href="/warden/outing-return" key={o.id} className="no-underline text-inherit">
                <div className="bg-white border border-slate-200 rounded-xl p-3 mb-2 flex items-center border-l-4 border-l-indigo-500">
                  <div className="w-16 text-xs text-slate-500 font-semibold shrink-0">{o.startedAt}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {o.type === "sick_pickup" ? "🏥" : o.type === "special" ? "⚠️" : "🚪"} {o.studentName} · Class {o.studentClass}
                      {o.type === "sick_pickup" ? " — sent home sick" : o.type === "special" ? " — special outing" : " — regular outing"}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {o.reasonNote || o.type}
                      {o.expectedReturn ? ` · Expected by ${o.expectedReturn}` : ""}
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full font-semibold uppercase ml-2 bg-blue-100 text-blue-800">
                    Tap when back
                  </span>
                </div>
              </Link>
            ))}
          </>
        )}

        <div className="text-[11px] text-slate-400 mt-4 text-center">
          ✅ Live from Supabase
        </div>
      </div>

      <BottomNav items={WARDEN_NAV} active="/warden" />
    </div>
  );
}
