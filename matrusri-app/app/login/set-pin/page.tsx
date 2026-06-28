"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetPinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const valid = pin.length === 4 && pin === confirm;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-blue-800 text-white text-center py-8 px-6">
        <h1 className="text-lg font-semibold">Set your PIN</h1>
        <p className="text-xs opacity-85 mt-1">4 digits · used for daily login</p>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <p className="text-sm text-slate-600 mb-4">
          Don&apos;t share your PIN. Every action you take is logged with your name.
        </p>

        <label className="text-sm font-semibold mt-2">New PIN</label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          className="mt-2 w-full text-center text-2xl tracking-[1em] py-3 border border-slate-300 rounded-lg bg-slate-50"
          placeholder="••••"
        />

        <label className="text-sm font-semibold mt-5">Confirm PIN</label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))}
          className="mt-2 w-full text-center text-2xl tracking-[1em] py-3 border border-slate-300 rounded-lg bg-slate-50"
          placeholder="••••"
        />

        {confirm.length === 4 && pin !== confirm && (
          <p className="text-xs text-red-600 mt-2">PINs don&apos;t match.</p>
        )}

        <button
          onClick={() => router.push("/warden")}
          disabled={!valid}
          className="mt-6 w-full bg-blue-800 text-white font-semibold py-4 rounded-lg disabled:bg-slate-300"
        >
          Save and continue
        </button>
      </div>
    </div>
  );
}
