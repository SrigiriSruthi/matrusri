"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOuting } from "@/lib/actions";

type Student = { id: string; name: string; class: string; dorm: string; parent_name: string };

// 2nd Saturday detection — special-day flag for management dashboard
function is2ndSaturday() {
  const now = new Date();
  if (now.getDay() !== 6) return false;
  const dayOfMonth = now.getDate();
  return dayOfMonth >= 8 && dayOfMonth <= 14;
}

export default function OutingNewClient({ students }: { students: Student[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Student | null>(null);
  // Simplified: just sick vs outing
  const [outingKind, setOutingKind] = useState<"sick" | "outing">("outing");
  const [reasonText, setReasonText] = useState("");
  const [returnTime, setReturnTime] = useState("21:00");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2nd Saturday is the regular outing day. Otherwise it's flagged for management.
  const isSpecialDay = !is2ndSaturday();

  const filtered = query
    ? students.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.parent_name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : students.slice(0, 8);

  async function submit() {
    if (!picked) return;
    setBusy(true);
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [hh, mm] = returnTime.split(":");
      const exp = `${today}T${hh}:${mm}:00`;

      // Map our 2 user-facing types to the DB's 3 internal types:
      //  - sick + non-2nd-Saturday → sick_pickup (always exception)
      //  - sick + 2nd-Saturday → sick_pickup (still exception, sick is always shown)
      //  - outing + 2nd-Saturday → regular
      //  - outing + non-2nd-Saturday → special
      let dbType: "regular" | "special" | "sick_pickup";
      if (outingKind === "sick") {
        dbType = "sick_pickup";
      } else {
        dbType = isSpecialDay ? "special" : "regular";
      }

      await createOuting({
        studentId: picked.id,
        type: dbType,
        reason: outingKind === "sick" ? "sick" : "other",
        reasonNote: reasonText || undefined,
        expectedReturnAt: exp,
      });
      alert("Request sent to staff approvers. You'll see it under 'Approved & waiting at gate' once approved.");
      router.push("/warden");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded mb-4">
        {isSpecialDay
          ? "Today is NOT the 2nd Saturday — this will be flagged for management as a special-day outing."
          : "Today is the 2nd Saturday — regular outing day."}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
        <label className="text-xs text-slate-500 block mb-2">Search student</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type name or parent name…"
          className="w-full border border-slate-300 rounded-lg px-3 py-3 text-base bg-white"
        />

        <div className="mt-3 border border-slate-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="text-center text-sm text-slate-500 py-4">No matches.</div>
          )}
          {filtered.map((s) => {
            const isPicked = picked?.id === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setPicked(s)}
                className={`w-full text-left px-3 py-3 border-b last:border-b-0 border-slate-200 ${isPicked ? "bg-blue-50" : "bg-white"}`}
              >
                <div className="font-semibold text-sm">
                  {s.name} · Class {s.class} · Dorm {s.dorm}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Parent: {s.parent_name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {picked && (
        <>
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
            Type
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setOutingKind("sick")}
              className={`py-3 rounded-lg text-sm font-semibold border ${
                outingKind === "sick"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-slate-50 text-slate-700 border-slate-300"
              }`}
            >
              🤒 Sick
            </button>
            <button
              onClick={() => setOutingKind("outing")}
              className={`py-3 rounded-lg text-sm font-semibold border ${
                outingKind === "outing"
                  ? "bg-blue-800 text-white border-blue-800"
                  : "bg-slate-50 text-slate-700 border-slate-300"
              }`}
            >
              🚪 Outing
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3">
            <label className="text-xs text-slate-500 block mb-1">Reason</label>
            <input
              type="text"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder={outingKind === "sick" ? "e.g., fever, vomiting" : "e.g., father in town for lunch"}
              className="w-full border border-slate-300 rounded p-2 text-sm"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 mb-4">
            <label className="text-xs text-slate-500 block mb-1">Expected return time (today)</label>
            <input
              type="time"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 text-sm"
            />
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded p-3 mb-3">{error}</div>}

          <button
            onClick={submit}
            disabled={busy}
            className="w-full bg-emerald-600 text-white font-semibold py-4 rounded-lg disabled:bg-slate-300"
          >
            {busy ? "Sending…" : "📤 Send to staff for approval"}
          </button>
          <button
            onClick={() => router.push("/warden")}
            className="w-full mt-2 bg-white text-blue-800 font-semibold py-4 rounded-lg border border-blue-800"
          >
            Cancel
          </button>
        </>
      )}

      {!picked && (
        <div className="text-center text-sm text-slate-500 mt-4">
          Pick a student to continue.
        </div>
      )}
    </div>
  );
}
