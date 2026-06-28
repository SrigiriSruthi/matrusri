"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  function update(i: number, v: string) {
    const digit = v.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`);
      el?.focus();
    }
  }

  const filled = otp.every((d) => d !== "");

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-blue-800 text-white text-center py-8 px-6">
        <h1 className="text-lg font-semibold">Enter OTP</h1>
        <p className="text-xs opacity-85 mt-1">Sent to +91 98765 43210</p>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <p className="text-sm text-slate-600 mb-4">
          Any 6 digits work in demo mode. In production, this is sent via SMS.
        </p>

        <div className="flex gap-2 justify-center my-4">
          {otp.map((d, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              value={d}
              onChange={(e) => update(i, e.target.value)}
              inputMode="numeric"
              maxLength={1}
              className="w-12 h-14 text-center text-2xl font-bold border border-slate-300 rounded-lg bg-white"
            />
          ))}
        </div>

        <div className="text-center mt-2">
          <button className="text-sm text-blue-700 underline">Resend OTP (in 45s)</button>
        </div>

        <button
          onClick={() => router.push("/login/set-pin")}
          disabled={!filled}
          className="mt-5 w-full bg-blue-800 text-white font-semibold py-4 rounded-lg disabled:bg-slate-300"
        >
          Verify OTP
        </button>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-slate-500 underline">
            ← Back
          </Link>
        </div>
      </div>
    </div>
  );
}
