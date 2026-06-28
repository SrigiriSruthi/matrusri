import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { getAuditLog } from "@/lib/fetchers";
import { formatTimeIST, todayIST, formatDateIST } from "@/lib/timezone";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, { icon: string; label: string }> = {
  "task.tap_done":          { icon: "✓",  label: "Task marked done" },
  "task.photo_submitted":   { icon: "📷", label: "Photo submitted" },
  "attendance.submitted":   { icon: "🔢", label: "Attendance submitted" },
  "attendance.verified":    { icon: "✓",  label: "Attendance verified" },
  "attendance.updated":     { icon: "🔢", label: "Attendance updated" },
  "sick.reported":          { icon: "🤒", label: "Sick reported" },
  "sick.primary_called":    { icon: "📞", label: "Primary parent called" },
  "sick.emergency_called":  { icon: "📞", label: "Emergency contact called" },
  "sick.recovered":         { icon: "✓",  label: "Sick: recovered" },
  "outing.requested":       { icon: "🚪", label: "Outing requested" },
  "outing.approved":        { icon: "✓",  label: "Outing approved by staff" },
  "outing.rejected":        { icon: "✗",  label: "Outing rejected" },
  "outing.parent_arrived":  { icon: "🚶", label: "Parent arrived — student released" },
  "outing.returned":        { icon: "🏠", label: "Student returned" },
  "student.created":        { icon: "🎓", label: "Student created" },
  "student.deactivated":    { icon: "🎓", label: "Student deactivated" },
  "student.activated":      { icon: "🎓", label: "Student reactivated" },
  "user.created":           { icon: "👤", label: "User created" },
  "user.deactivated":       { icon: "👤", label: "User deactivated" },
  "user.activated":         { icon: "👤", label: "User reactivated" },
  "user.password_changed":  { icon: "🔒", label: "Password changed" },
  "user.language_changed":  { icon: "🌐", label: "Language changed" },
  "task_instances.generated": { icon: "⚙️", label: "Today's tasks generated" },
  "task_template.updated":  { icon: "🕒", label: "Task template updated" },
  "task_template.reassigned": { icon: "🕒", label: "Task reassigned" },
  "laundry.issue_added":    { icon: "🧺", label: "Laundry issue reported" },
  "laundry.issue_cleared":  { icon: "🧺", label: "Laundry issue cleared" },
};

function formatTime(iso: string) {
  return formatTimeIST(iso);
}

function shiftDate(dateStr: string, days: number): string {
  // dateStr is YYYY-MM-DD
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function prettyDateLabel(dateStr: string, todayStr: string): string {
  if (dateStr === todayStr) return "Today";
  const yesterday = shiftDate(todayStr, -1);
  if (dateStr === yesterday) return "Yesterday";
  // Otherwise format as e.g. "27 Jun"
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return formatDateIST(date);
}

export default async function ActivityLog({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await guardRole("management");
  const { date: rawDate } = await searchParams;
  const today = todayIST();
  const date = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : today;

  const log = await getAuditLog({ limit: 500, date });

  type Row = {
    id: string;
    action: string;
    entity_type: string | null;
    entity_id: string | null;
    details: Record<string, unknown> | null;
    created_at: string;
    actor: { name: string } | null;
  };
  const rows = (log as unknown as Row[]) ?? [];

  const prevHref = `/management/activity?date=${shiftDate(date, -1)}`;
  const nextHref = `/management/activity?date=${shiftDate(date, 1)}`;
  const isToday = date === today;

  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader
        back="/management"
        title="Activity log"
        subtitle={`${prettyDateLabel(date, today)} · ${rows.length} event${rows.length === 1 ? "" : "s"}`}
      />

      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-2">
        <Link
          href={prevHref}
          className="px-3 py-1 rounded-full text-xs bg-white border border-slate-300 text-slate-700 no-underline"
        >
          ← Previous day
        </Link>
        <form action="/management/activity" method="get" className="flex items-center gap-2">
          <input
            type="date"
            name="date"
            defaultValue={date}
            max={today}
            className="border border-slate-300 rounded px-2 py-1 text-xs bg-white"
          />
          <button type="submit" className="text-xs bg-blue-800 text-white px-3 py-1 rounded-full">
            Go
          </button>
        </form>
        {isToday ? (
          <span className="px-3 py-1 rounded-full text-xs bg-slate-200 text-slate-400">
            Today (latest) →
          </span>
        ) : (
          <Link
            href={nextHref}
            className="px-3 py-1 rounded-full text-xs bg-white border border-slate-300 text-slate-700 no-underline"
          >
            Next day →
          </Link>
        )}
      </div>

      <div className="p-4">
        {rows.length === 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-sm text-slate-500">
            No activity recorded for this date.
          </div>
        )}
        {rows.map((e) => {
          const label = ACTION_LABELS[e.action] ?? { icon: "•", label: e.action };
          const isMissed = e.action.includes("rejected");
          const bar = isMissed ? "border-l-red-500" : "border-l-emerald-500";
          return (
            <div
              key={e.id}
              className={`bg-white border border-slate-200 border-l-4 ${bar} rounded-xl p-3 mb-2 flex items-start`}
            >
              <div className="text-xl mr-3">{label.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{label.label}</div>
                <div className="text-xs text-slate-500 truncate">
                  by {e.actor?.name ?? "system"}
                  {e.entity_type && <> · {e.entity_type}</>}
                </div>
              </div>
              <div className="text-[11px] text-slate-500 ml-2 whitespace-nowrap">{formatTime(e.created_at)}</div>
            </div>
          );
        })}
        <div className="text-[11px] text-slate-400 text-center mt-4">
          Text records kept forever · photos auto-delete after 30 days
        </div>
      </div>
    </div>
  );
}
