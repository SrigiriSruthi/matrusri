"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitAttendance, markTaskTapDone } from "@/lib/actions";

type Props = {
  taskInstanceId: string;
  slot: 1 | 2 | 3 | 4 | 5;
  enrolledBoys: number;
  enrolledGirls: number;
  onOuting: number;
};

export default function AttendanceClient(props: Props) {
  const router = useRouter();
  const [boys, setBoys] = useState(Math.max(0, props.enrolledBoys - Math.ceil(props.onOuting / 2)));
  const [girls, setGirls] = useState(Math.max(0, props.enrolledGirls - Math.floor(props.onOuting / 2)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalEnrolled = props.enrolledBoys + props.enrolledGirls;
  const present = boys + girls;
  const absentWithoutPermission = Math.max(0, totalEnrolled - present - props.onOuting);
  const checkTotal = present + props.onOuting + absentWithoutPermission;
  const valid = checkTotal === totalEnrolled && present <= totalEnrolled - props.onOuting;

  async function submit() {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      await submitAttendance({
        slotNumber: props.slot,
        boysPresent: boys,
        girlsPresent: girls,
        absentWithPermission: props.onOuting,
        absentWithoutPermission: absentWithoutPermission,
      });
      await markTaskTapDone(props.taskInstanceId);
      router.push("/warden");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded mb-4">
        Submit count-based attendance for slot #{props.slot}.
        {props.slot === 3 && (
          <div className="mt-1">
            <strong>Cross-verification:</strong> if a different warden has already
            submitted this slot, your submission verifies the count.
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
        <div className="text-xs text-slate-500 text-center mb-3">Total enrolled today</div>
        <div className="flex justify-around">
          <div className="text-center">
            <div className="text-[11px] text-slate-500">Boys</div>
            <div className="text-2xl font-bold">{props.enrolledBoys}</div>
          </div>
          <div className="text-center">
            <div className="text-[11px] text-slate-500">Girls</div>
            <div className="text-2xl font-bold">{props.enrolledGirls}</div>
          </div>
          <div className="text-center">
            <div className="text-[11px] text-slate-500">On approved<br />outing</div>
            <div className="text-2xl font-bold text-blue-700">{props.onOuting}</div>
          </div>
        </div>
      </div>

      <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
        Present count
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <label className="block text-xs text-slate-500 mb-1">Boys present</label>
          <input
            type="number"
            inputMode="numeric"
            value={boys}
            onChange={(e) => setBoys(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full text-center text-2xl font-bold border border-slate-300 rounded p-2 bg-white"
          />
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
          <label className="block text-xs text-slate-500 mb-1">Girls present</label>
          <input
            type="number"
            inputMode="numeric"
            value={girls}
            onChange={(e) => setGirls(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full text-center text-2xl font-bold border border-slate-300 rounded p-2 bg-white"
          />
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-5">
        <div className="flex justify-between text-sm">
          <span>Absent — with permission</span>
          <strong>{props.onOuting}</strong>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span>Absent — without permission</span>
          <strong className="text-red-600">{absentWithoutPermission}</strong>
        </div>
        <div className="h-px bg-slate-200 my-3" />
        <div className="flex justify-between text-sm">
          <span>Check: {boys} + {girls} + {props.onOuting} + {absentWithoutPermission}</span>
          <strong className={valid ? "text-emerald-600" : "text-red-600"}>
            {checkTotal} {valid ? "✓" : "✗"}
          </strong>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded p-3 mb-3">{error}</div>}

      <button
        onClick={submit}
        disabled={!valid || busy}
        className="w-full bg-blue-800 text-white font-semibold py-4 rounded-lg disabled:bg-slate-300"
      >
        {busy ? "Submitting…" : "📤 Submit"}
      </button>
      <button
        onClick={() => router.push("/warden")}
        className="w-full mt-2 bg-white text-blue-800 font-semibold py-4 rounded-lg border border-blue-800"
      >
        Cancel
      </button>
    </div>
  );
}
