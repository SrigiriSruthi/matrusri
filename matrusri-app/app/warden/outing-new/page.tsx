"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneHeader from "@/components/PhoneHeader";

type Step = 1 | 2 | 3;

const RESULTS = [
  { id: "s1", name: "Ravi Kumar", class: "8", dorm: "A", roll: "0045", parent: "Mother: Sujatha", phoneMask: "+91 98xxx xxxxx" },
  { id: "s2", name: "Ravindra Reddy", class: "7", dorm: "B", roll: "0078", parent: "Father: Krishna", phoneMask: "+91 99xxx xxxxx" },
  { id: "s3", name: "Ravi Teja", class: "9", dorm: "A", roll: "0102", parent: "Mother: Padma", phoneMask: "+91 97xxx xxxxx" },
];

const REASONS = [
  { id: "sick", label: "🤒 Sick" },
  { id: "family", label: "👨‍👩‍👧 Family event" },
  { id: "doctor", label: "🏥 Doctor visit" },
  { id: "emergency", label: "🚨 Emergency" },
  { id: "other", label: "📝 Other" },
];

export default function OutingNewFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [query, setQuery] = useState("Ravi");
  const [picked, setPicked] = useState(RESULTS[0]);
  const [otp, setOtp] = useState(["4", "7", "2", "9"]);
  const [reason, setReason] = useState<string>("family");
  const [note, setNote] = useState("Father in town for lunch");
  const [returnTime, setReturnTime] = useState("9:00 pm today");

  function backOrCancel() {
    if (step === 1) router.push("/warden");
    else setStep((step - 1) as Step);
  }

  return (
    <div className="min-h-screen">
      <PhoneHeader
        back="/warden"
        title="Start outing"
        subtitle={`Step ${step} of 3${step === 1 ? " · Parent at gate" : ""}`}
      />

      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded mb-4">
          {step === 1 && <>Step 1 of 3 — Pick the student whose parent is here</>}
          {step === 2 && <>Step 2 of 3 — Ask parent to read OTP aloud</>}
          {step === 3 && <>Step 3 of 3 — Reason + send for approval</>}
        </div>

        {step === 1 && (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
              <label className="text-xs text-slate-500 block mb-2">Search student</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type name or roll no…"
                className="w-full border border-slate-300 rounded-lg px-3 py-3 text-base"
              />
              <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
                {RESULTS.map((r) => {
                  const isPicked = picked.id === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setPicked(r)}
                      className={`w-full text-left px-3 py-3 border-b last:border-b-0 border-slate-200 ${
                        isPicked ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <div className="font-semibold text-sm">
                        {r.name} · Class {r.class} · Dorm {r.dorm}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Roll {r.roll} · {r.parent} · {r.phoneMask}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-3 text-xs text-slate-600 mb-4">
              <div className="font-semibold mb-1">After picking student:</div>
              <ol className="list-decimal pl-5 space-y-1">
                <li>System sends OTP to <strong>{picked.phoneMask}</strong></li>
                <li>Parent reads OTP aloud → you type it in</li>
                <li>Pick reason chip (if special day)</li>
                <li>Any one staff approver gets the request → approves</li>
                <li>Student released. Marked &ldquo;absent with permission.&rdquo;</li>
              </ol>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-800 text-white font-semibold py-4 rounded-lg"
            >
              Next: Send OTP to parent
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
              <div className="font-bold text-base">
                {picked.name} · Class {picked.class}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {picked.parent} · {picked.phoneMask}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded mb-3">
              ✓ OTP sent at 6:30 pm — ask parent to read it aloud
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
              <label className="text-sm font-semibold block mb-2">Enter OTP from parent</label>
              <div className="flex gap-2 justify-center">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    value={d}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 1);
                      const next = [...otp];
                      next[i] = v;
                      setOtp(next);
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 h-14 text-center text-2xl font-bold border border-slate-300 rounded-lg"
                  />
                ))}
              </div>
              <div className="text-center mt-3">
                <button className="text-xs text-blue-700 underline">Resend OTP</button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800 mb-4">
              Today is <strong>Wednesday</strong> — not the 2nd Saturday.
              <br />
              This is a <strong>special-day request</strong>. Staff must pick a reason after OTP.
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={otp.some((d) => !d)}
              className="w-full bg-emerald-600 text-white font-semibold py-4 rounded-lg disabled:bg-slate-300"
            >
              ✓ Verify OTP
            </button>
            <button
              onClick={backOrCancel}
              className="w-full mt-2 bg-white text-blue-800 font-semibold py-4 rounded-lg border border-blue-800"
            >
              Back
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
              <div className="font-bold">
                {picked.name} · Class {picked.class}
              </div>
              <div className="text-xs text-emerald-700 mt-1">
                ✓ Parent OTP verified · 6:31 pm
              </div>
            </div>

            <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
              Pick reason (required)
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {REASONS.map((r) => {
                const picked2 = reason === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setReason(r.id)}
                    className={`px-3 py-2 rounded-full text-xs border ${
                      picked2
                        ? "bg-blue-800 text-white border-blue-800"
                        : "bg-slate-100 text-slate-700 border-slate-300"
                    }`}
                  >
                    {r.label} {picked2 ? "✓" : ""}
                  </button>
                );
              })}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3">
              <label className="text-xs text-slate-500 block mb-1">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-sm"
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 mb-3">
              <label className="text-xs text-slate-500 block mb-1">Expected return</label>
              <input
                type="text"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-sm"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded mb-4">
              Sending to all 3 staff approvers. Any one of them can release.
            </div>

            <button
              onClick={() => {
                alert(
                  "Request sent to Suresh, Lakshmi, Priya. You'll be notified when one approves."
                );
                router.push("/warden");
              }}
              className="w-full bg-emerald-600 text-white font-semibold py-4 rounded-lg"
            >
              📤 Send for approval
            </button>
            <button
              onClick={backOrCancel}
              className="w-full mt-2 bg-white text-blue-800 font-semibold py-4 rounded-lg border border-blue-800"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
