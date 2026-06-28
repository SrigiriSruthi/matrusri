"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addLaundryIssue, clearLaundryIssue } from "@/lib/actions";

type Issue = {
  id: string;
  item_count: number;
  issue_type: string;
  note: string | null;
  created_at: string;
  student: { name: string; class: string; dorm: string } | null;
  creator: { name: string } | null;
};

type Student = { id: string; name: string; class: string };

const TYPE_LABEL: Record<string, { icon: string; label: string; bar: string }> = {
  missing:     { icon: "🟥", label: "Missing",     bar: "border-l-red-500" },
  damaged:     { icon: "🟧", label: "Damaged",     bar: "border-l-orange-500" },
  uncollected: { icon: "🟨", label: "Uncollected", bar: "border-l-amber-500" },
  other:       { icon: "⬜", label: "Other",       bar: "border-l-slate-400" },
};

function daysSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (24 * 3600 * 1000));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function LaundryClient({
  issues,
  students,
  tableAvailable,
}: {
  issues: Issue[];
  students: Student[];
  tableAvailable: boolean;
}) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [itemCount, setItemCount] = useState(1);
  const [issueType, setIssueType] = useState<"missing" | "damaged" | "uncollected" | "other">("missing");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!studentId || itemCount < 1) return;
    setBusy(true);
    setError(null);
    try {
      await addLaundryIssue({ studentId, itemCount, issueType, note: note || undefined });
      setShowAdd(false);
      setStudentId("");
      setItemCount(1);
      setIssueType("missing");
      setNote("");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function clearIt(id: string, studentName?: string) {
    if (!confirm(`Clear this issue for ${studentName ?? "this student"}? Once resolved, it disappears from the list.`)) return;
    await clearLaundryIssue(id);
    router.refresh();
  }

  if (!tableAvailable) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded p-4">
        <strong>Laundry table not yet enabled.</strong>
        <div className="text-xs mt-1">
          Management: run <code>db/11_laundry_issues.sql</code> in Supabase to enable.
        </div>
      </div>
    );
  }

  return (
    <div>
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full bg-blue-800 text-white font-semibold py-4 rounded-lg mb-4"
        >
          ➕ Add problem
        </button>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <div className="font-semibold mb-3">Report a laundry problem</div>

          <label className="text-xs text-slate-500 block mb-1">Student</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full border border-slate-300 rounded p-2 text-sm bg-white mb-3"
          >
            <option value="">Pick a student…</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · Class {s.class}
              </option>
            ))}
          </select>

          <label className="text-xs text-slate-500 block mb-1">Issue</label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {(["missing", "damaged", "uncollected", "other"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setIssueType(t)}
                className={`text-sm py-2 rounded border ${
                  issueType === t
                    ? "bg-blue-800 text-white border-blue-800"
                    : "bg-slate-50 text-slate-700 border-slate-300"
                }`}
              >
                {TYPE_LABEL[t].icon} {TYPE_LABEL[t].label}
              </button>
            ))}
          </div>

          <label className="text-xs text-slate-500 block mb-1">How many items</label>
          <input
            type="number"
            inputMode="numeric"
            value={itemCount}
            min={1}
            onChange={(e) => setItemCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full border border-slate-300 rounded p-2 text-sm mb-3"
          />

          <label className="text-xs text-slate-500 block mb-1">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., blue shirt missing"
            className="w-full border border-slate-300 rounded p-2 text-sm mb-3"
          />

          {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!studentId || itemCount < 1 || busy}
              className="flex-1 bg-emerald-600 text-white font-semibold py-2.5 rounded-lg text-sm disabled:bg-slate-300"
            >
              {busy ? "Saving…" : "Submit"}
            </button>
            <button
              onClick={() => { setShowAdd(false); setError(null); }}
              className="flex-1 bg-white text-blue-800 font-semibold py-2.5 rounded-lg text-sm border border-blue-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {issues.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded p-4 text-center">
          ✓ No open laundry problems. Everything sorted.
        </div>
      )}

      {issues.length > 0 && (
        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
          Open issues ({issues.length})
        </div>
      )}

      {issues.map((it) => {
        const t = TYPE_LABEL[it.issue_type] ?? TYPE_LABEL.other;
        return (
          <div
            key={it.id}
            className={`bg-white border border-slate-200 border-l-4 ${t.bar} rounded-xl p-3 mb-2`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">
                  {t.icon} {it.student?.name} · Class {it.student?.class}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {it.item_count} item{it.item_count === 1 ? "" : "s"} · {t.label}
                </div>
                {it.note && (
                  <div className="text-xs text-slate-600 mt-1">&ldquo;{it.note}&rdquo;</div>
                )}
                <div className="text-[11px] text-slate-400 mt-1">
                  Reported {daysSince(it.created_at)} by {it.creator?.name ?? "—"}
                </div>
              </div>
              <button
                onClick={() => clearIt(it.id, it.student?.name)}
                className="bg-emerald-600 text-white text-xs font-semibold py-1.5 px-3 rounded ml-2 shrink-0"
              >
                ✓ Clear
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
