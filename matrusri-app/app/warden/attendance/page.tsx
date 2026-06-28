"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneHeader from "@/components/PhoneHeader";

const ENROLLED_BOYS = 85;
const ENROLLED_GIRLS = 65;
const ON_OUTING = 7;

export default function AttendanceEntry() {
  const router = useRouter();
  const [boys, setBoys] = useState(78);
  const [girls, setGirls] = useState(61);

  const present = boys + girls;
  const totalEnrolled = ENROLLED_BOYS + ENROLLED_GIRLS;
  const absentWithoutPermission = Math.max(0, totalEnrolled - present - ON_OUTING);
  const checkTotal = present + ON_OUTING + absentWithoutPermission;
  const valid = checkTotal === totalEnrolled && present <= totalEnrolled - ON_OUTING;

  return (
    <div className="min-h-screen">
      <PhoneHeader
        back="/warden"
        title="Attendance #4"
        subtitle="Afternoon · 6:00 pm"
      />

      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded mb-4">
          ⏰ Window: 6:00 – 8:00 pm · Now 6:18 pm
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <div className="text-xs text-slate-500 text-center mb-3">Total enrolled today</div>
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-[11px] text-slate-500">Boys</div>
              <div className="text-2xl font-bold">{ENROLLED_BOYS}</div>
            </div>
            <div className="text-center">
              <div className="text-[11px] text-slate-500">Girls</div>
              <div className="text-2xl font-bold">{ENROLLED_GIRLS}</div>
            </div>
            <div className="text-center">
              <div className="text-[11px] text-slate-500">
                On approved
                <br />
                outing
              </div>
              <div className="text-2xl font-bold text-blue-700">{ON_OUTING}</div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 text-center mt-2">
            Outing count auto-filled from approved requests
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
              onChange={(e) => setBoys(parseInt(e.target.value) || 0)}
              className="w-full text-center text-2xl font-bold border border-slate-300 rounded p-2 bg-white"
            />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <label className="block text-xs text-slate-500 mb-1">Girls present</label>
            <input
              type="number"
              inputMode="numeric"
              value={girls}
              onChange={(e) => setGirls(parseInt(e.target.value) || 0)}
              className="w-full text-center text-2xl font-bold border border-slate-300 rounded p-2 bg-white"
            />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-5">
          <div className="flex justify-between text-sm">
            <span>Absent — with permission</span>
            <strong>{ON_OUTING}</strong>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>Absent — without permission</span>
            <strong className="text-red-600">{absentWithoutPermission}</strong>
          </div>
          <div className="h-px bg-slate-200 my-3" />
          <div className="flex justify-between text-sm">
            <span>
              Check: {boys} + {girls} + {ON_OUTING} + {absentWithoutPermission}
            </span>
            <strong className={valid ? "text-emerald-600" : "text-red-600"}>
              {checkTotal} {valid ? "✓" : "✗"}
            </strong>
          </div>
        </div>

        <button
          onClick={() => router.push("/warden")}
          disabled={!valid}
          className="w-full bg-blue-800 text-white font-semibold py-4 rounded-lg disabled:bg-slate-300"
        >
          📤 Submit
        </button>
        <button
          onClick={() => router.push("/warden")}
          className="w-full mt-2 bg-white text-blue-800 font-semibold py-4 rounded-lg border border-blue-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
