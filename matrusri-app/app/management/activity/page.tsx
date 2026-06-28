import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { getAuditLog } from "@/lib/fetchers";

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
  "sick.outcome_resting":   { icon: "🛏", label: "Sick: resting" },
  "sick.outcome_sent_home": { icon: "🏠", label: "Sick: sent home" },
  "sick.outcome_at_doctor": { icon: "🏥", label: "Sick: at doctor" },
  "sick.outcome_recovered": { icon: "✓",  label: "Sick: recovered" },
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
  "task_instances.generated": { icon: "⚙️", label: "Today's tasks generated" },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const a = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${a}`;
}

export default async function ActivityLog() {
  await guardRole("management");
  const log = await getAuditLog({ limit: 200 });

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

  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader back="/management" title="Activity log" subtitle="Today · all events" />

      <div className="p-4">
        {rows.length === 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-sm text-slate-500">
            No activity yet today. Actions will appear here as they happen.
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
          Live from Supabase · text records kept forever · photos 30 days
        </div>
      </div>
    </div>
  );
}
