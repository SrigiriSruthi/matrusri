"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addSickLog, markSickParentCalled, setSickOutcome } from "@/lib/actions";

type SickLog = {
  id: string;
  symptoms: string;
  reported_at: string;
  parent_called_at: string | null;
  emergency_called_at: string | null;
  outcome: string | null;
  student: {
    name: string;
    class: string;
    parent_name: string;
    parent_phone: string;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
  } | null;
};

type Student = { id: string; name: string; class: string };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  const m = mins % 60;
  if (hrs < 24) return `${hrs} hr ${m} min ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes();
  const a = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${a}`;
}

export default function SickBayClient({ sickLogs, students }: { sickLogs: SickLog[]; students: Student[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!studentId || !symptoms.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await addSickLog({ studentId, symptoms: symptoms.trim() });
      setShowAdd(false);
      setStudentId("");
      setSymptoms("");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function callParent(id: string, type: "primary" | "emergency") {
    await markSickParentCalled(id, type);
    router.refresh();
  }

  async function setOutcome(id: string, outcome: "resting" | "sent_home" | "at_doctor" | "recovered") {
    await setSickOutcome(id, outcome);
    if (outcome === "sent_home") {
      alert("Sent home: outing created, pending staff approval.");
    }
    router.refresh();
  }

  return (
    <div>
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full bg-blue-800 text-white font-semibold py-4 rounded-lg mb-4"
        >
          ➕ Add sick student
        </button>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <div className="font-semibold mb-3">New sick report</div>
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
          <label className="text-xs text-slate-500 block mb-1">Symptoms</label>
          <input
            type="text"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g., Fever, headache"
            className="w-full border border-slate-300 rounded p-2 text-sm mb-3"
          />
          {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!studentId || !symptoms.trim() || busy}
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

      {sickLogs.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded p-3 text-center">
          ✓ No active sick reports. Everyone&apos;s well!
        </div>
      )}

      <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
        Active ({sickLogs.length})
      </div>

      {sickLogs.map((s) => {
        const parentCalled = !!s.parent_called_at;
        const overOneHour = !parentCalled && Date.now() - new Date(s.reported_at).getTime() > 60 * 60 * 1000;
        const needsOutcome = parentCalled && !s.outcome;

        return (
          <div
            key={s.id}
            className={`bg-white border border-slate-200 border-l-4 ${
              overOneHour ? "border-l-red-500" : parentCalled && !s.outcome ? "border-l-amber-500" : "border-l-indigo-500"
            } rounded-xl p-4 mb-3`}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">
                  {s.student?.name} · Class {s.student?.class}
                </div>
                <div className="text-xs text-slate-500">{s.symptoms}</div>
              </div>
              {overOneHour ? (
                <span className="text-[10px] px-2 py-1 rounded-full font-semibold uppercase bg-red-100 text-red-800">
                  Call parent!
                </span>
              ) : parentCalled ? (
                <span className="text-[10px] px-2 py-1 rounded-full font-semibold uppercase bg-blue-100 text-blue-800">
                  Parent called
                </span>
              ) : (
                <span className="text-[10px] px-2 py-1 rounded-full font-semibold uppercase bg-amber-100 text-amber-800">
                  Reported
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Reported {formatTime(s.reported_at)} · {timeAgo(s.reported_at)}
              {parentCalled && <> · Called {formatTime(s.parent_called_at)}</>}
            </div>

            {overOneHour && (
              <div className="mt-2 bg-red-50 rounded p-2 text-xs text-red-700">
                🔴 Over 1 hour — parent must be called now
              </div>
            )}

            {!parentCalled && (
              <>
                <div className="mt-2 bg-slate-50 rounded p-2 text-xs space-y-1">
                  <div>📞 {s.student?.parent_name}: <span className="text-blue-700">{s.student?.parent_phone}</span></div>
                  {s.student?.emergency_contact_name && (
                    <div>📞 Emergency ({s.student.emergency_contact_name}): <span className="text-blue-700">{s.student.emergency_contact_phone}</span></div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => callParent(s.id, "primary")}
                    className="flex-1 bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-lg"
                  >
                    📞 Primary called
                  </button>
                  {s.student?.emergency_contact_name && (
                    <button
                      onClick={() => callParent(s.id, "emergency")}
                      className="flex-1 bg-white text-blue-800 text-sm font-semibold py-2.5 rounded-lg border border-blue-800"
                    >
                      📞 Emergency called
                    </button>
                  )}
                </div>
              </>
            )}

            {needsOutcome && (
              <>
                <div className="text-sm font-semibold mt-3">Pick outcome:</div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button onClick={() => setOutcome(s.id, "resting")} className="bg-white text-blue-800 text-sm font-semibold py-2.5 rounded-lg border border-blue-800">🛏 Resting</button>
                  <button onClick={() => setOutcome(s.id, "sent_home")} className="bg-white text-blue-800 text-sm font-semibold py-2.5 rounded-lg border border-blue-800">🏠 Sent home</button>
                  <button onClick={() => setOutcome(s.id, "at_doctor")} className="bg-white text-blue-800 text-sm font-semibold py-2.5 rounded-lg border border-blue-800">🏥 Doctor</button>
                  <button onClick={() => setOutcome(s.id, "recovered")} className="bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-lg">✓ Recovered</button>
                </div>
                <div className="text-[11px] text-slate-400 text-center mt-2">
                  &ldquo;Sent home&rdquo; triggers an outing request to staff.
                </div>
              </>
            )}

            {s.outcome === "resting" && (
              <div className="text-xs text-slate-500 mt-2">
                🛏 Resting in hostel
                <button
                  onClick={() => setOutcome(s.id, "recovered")}
                  className="ml-3 text-blue-700 underline"
                >
                  Mark recovered
                </button>
              </div>
            )}

            {s.outcome === "at_doctor" && (
              <div className="text-xs text-slate-500 mt-2">🏥 At doctor</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
