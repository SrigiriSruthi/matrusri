"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginWelcome() {
  const router = useRouter();
  const [phone, setPhone] = useState("9876543210");

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-blue-800 text-white text-center py-10 px-6">
        <div className="text-4xl mb-2">🏠</div>
        <h1 className="text-xl font-bold">Matrusri Hostel</h1>
        <p className="text-xs opacity-85 mt-1">Welcome back</p>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <label className="text-sm font-semibold mb-2">Phone number</label>
        <div className="flex gap-2 items-center border border-slate-300 rounded-lg px-3 py-3 bg-slate-50">
          <span className="text-slate-600 font-semibold">+91</span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            className="flex-1 bg-transparent outline-none text-base"
            placeholder="98765 43210"
          />
        </div>

        <button
          onClick={() => router.push("/login/otp")}
          disabled={phone.length !== 10}
          className="mt-5 w-full bg-blue-800 text-white font-semibold py-4 rounded-lg disabled:bg-slate-300"
        >
          Send OTP
        </button>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-slate-500 underline">
            Back to demo home
          </Link>
        </div>

        <div className="mt-auto pt-6 text-xs text-slate-400 text-center">
          Phone is verified once. Daily login uses a 4-digit PIN.
        </div>
      </div>
    </div>
  );
}
