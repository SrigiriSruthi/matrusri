"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setLaundryPending } from "@/lib/actions";

function formatTime(iso: string | null) {
  if (!iso) return "never";
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  let h = d.getHours();
  const m = d.getMinutes();
  const a = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${day} · ${h}:${m.toString().padStart(2, "0")} ${a}`;
}

export default function LaundryClient({
  pendingCount,
  lastUpdatedAt,
  lastUpdatedBy,
  available,
}: {
  pendingCount: number;
  lastUpdatedAt: string | null;
  lastUpdatedBy: string | null;
  available: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState(pendingCount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (count === pendingCount) return;
    setBusy(true);
    setError(null);
    try {
      await setLaundryPending(count);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function bump(delta: number) {
    setCount(Math.max(0, count + delta));
  }

  if (!available) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded p-4">
        <strong>Laundry not yet enabled.</strong>
        <div className="text-xs mt-1">
          Management: run <code>db/09_laundry_simple.sql</code> in Supabase to enable.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4 text-center">
        <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">
          Pending pickup
        </div>
        <div className={`text-6xl font-bold mb-1 ${count > 0 ? "text-amber-600" : "text-emerald-600"}`}>
          {count}
        </div>
        <div className="text-xs text-slate-500">
          items waiting for vendor
        </div>
      </div>

      <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
        Update count
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => bump(-10)}
            className="bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded"
          >
            -10
          </button>
          <button
            onClick={() => bump(-1)}
            className="bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded"
          >
            -1
          </button>
          <input
            type="number"
            inputMode="numeric"
            value={count}
            onChange={(e) => setCount(Math.max(0, parseInt(e.target.value) || 0))}
            className="flex-1 text-center text-2xl font-bold border border-slate-300 rounded p-2"
          />
          <button
            onClick={() => bump(1)}
            className="bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded"
          >
            +1
          </button>
          <button
            onClick={() => bump(10)}
            className="bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded"
          >
            +10
          </button>
        </div>

        {error && <div className="mt-3 text-xs text-red-600">{error}</div>}

        <button
          onClick={save}
          disabled={count === pendingCount || busy}
          className="w-full mt-4 bg-blue-800 text-white font-semibold py-3 rounded-lg disabled:bg-slate-300"
        >
          {busy ? "Saving…" : count === pendingCount ? "No change" : "Save"}
        </button>

        {count === 0 && pendingCount > 0 && (
          <div className="mt-2 text-[11px] text-emerald-700 text-center">
            Marking as all picked up by vendor.
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-500 text-center mb-4">
        Last updated by {lastUpdatedBy ?? "—"} · {formatTime(lastUpdatedAt)}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800">
        <strong>How this works:</strong> set the count to how many laundry items are
        waiting for the vendor. When the vendor picks them up, set it back to 0. Numbers
        carry forward across days — if items aren&apos;t picked up today, they&apos;re still
        pending tomorrow.
      </div>
    </div>
  );
}
