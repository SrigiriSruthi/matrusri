import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import TaskCard from "@/components/TaskCard";
import { getWardenToday, getMyOutingRequestsToday } from "@/lib/warden";
import { guardRole } from "@/lib/guard";
import { t } from "@/lib/i18n";
import { formatDateIST, formatTimeIST } from "@/lib/timezone";

export const dynamic = "force-dynamic";

const WARDEN_NAV = [
  { href: "/warden", icon: "📋", label: "Tasks" },
  { href: "/warden/outing-new", icon: "🚪", label: "Outings" },
  { href: "/warden/sick", icon: "🤒", label: "Sick" },
  { href: "/warden/laundry", icon: "🧺", label: "Laundry" },
  { href: "/warden/me", icon: "👤", label: "Me" },
];

function nowSubtitle() {
  const now = new Date();
  return `${formatDateIST(now)} · ${formatTimeIST(now)}`;
}

type RequestRow = Awaited<ReturnType<typeof getMyOutingRequestsToday>>[number];

function statusBadge(s: RequestRow["status"]) {
  switch (s) {
    case "pending_approval":
      return { label: "🟡 Waiting for staff", cls: "bg-amber-100 text-amber-800" };
    case "pending_gate":
      return { label: "✅ Approved · waiting at gate", cls: "bg-emerald-100 text-emerald-800" };
    case "active":
      return { label: "🚪 Out now", cls: "bg-blue-100 text-blue-800" };
    case "closed":
      return { label: "🏠 Returned", cls: "bg-slate-100 text-slate-700" };
    case "rejected":
      return { label: "❌ Rejected", cls: "bg-red-100 text-red-800" };
  }
}

export default async function WardenHome() {
  const me = await guardRole("warden");
  const [tasksRaw, myRequests] = await Promise.all([
    getWardenToday(me.id),
    getMyOutingRequestsToday(me.id),
  ]);
  // Translate display name to the user's language but keep the English name
  // around for routing decisions (e.g. "Attendance" / "Laundry" prefix match).
  const tasks = tasksRaw.map((task) => ({
    ...task,
    englishName: task.name,
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

        {myRequests.length > 0 && (
          <div className="mb-4">
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
              My outing requests today ({myRequests.length})
            </div>
            {myRequests.map((r) => {
              const badge = statusBadge(r.status);
              return (
                <div
                  key={r.id}
                  className="bg-white border border-slate-200 rounded-xl p-3 mb-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-semibold text-sm">
                      {r.studentName} · Class {r.studentClass}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  {r.reasonNote && (
                    <div className="text-xs text-slate-500 mt-1">&ldquo;{r.reasonNote}&rdquo;</div>
                  )}
                  <div className="text-[11px] text-slate-500 mt-1">
                    Sent {r.createdAt}
                    {r.approverName && r.approvedAt && (
                      <> · {r.status === "rejected" ? "Rejected" : "Approved"} by {r.approverName} at {r.approvedAt}</>
                    )}
                    {r.startedAt && <> · Left {r.startedAt}</>}
                    {r.returnedAt && <> · Returned {r.returnedAt}</>}
                  </div>
                  {r.status === "rejected" && r.rejectionReason && (
                    <div className="text-xs text-red-700 mt-1">
                      <span className="font-semibold">Reason:</span> {r.rejectionReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
          Today&apos;s tasks · in time order
        </div>

        {tasks.map((task) => {
          // Route by proof_type, not by display name — names get translated and
          // also get renamed by management in the schedule editor.
          // Laundry is the one exception that still needs a name check (no
          // other signal distinguishes it from generic tap tasks).
          const href =
            task.proofType === "count"
              ? `/warden/attendance/${task.id}`
              : task.englishName.toLowerCase().startsWith("laundry")
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
