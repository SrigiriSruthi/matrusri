"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        setBusy(false);
        return;
      }
      router.push(data.redirectTo);
    } catch {
      setError("Network error. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-blue-800 text-white text-center py-12 px-6">
        <div className="text-5xl mb-3">🏠</div>
        <h1 className="text-2xl font-bold">Matrusri Hostel</h1>
        <p className="text-sm opacity-85 mt-1">Welcome back</p>
      </div>

      <form onSubmit={submit} className="p-5 flex-1 flex flex-col">
        <label className="text-sm font-semibold mb-2">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          placeholder="e.g. lakshmi"
          className="w-full border border-slate-300 rounded-lg px-3 py-3 text-base bg-white"
        />

        <label className="text-sm font-semibold mt-4 mb-2">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full border border-slate-300 rounded-lg px-3 py-3 text-base bg-white pr-20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-700 px-2 py-1"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy || !username || !password}
          className="mt-5 w-full bg-blue-800 text-white font-semibold py-4 rounded-lg disabled:bg-slate-300"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-slate-500 underline">
            Back to demo home
          </Link>
        </div>

        <div className="mt-auto pt-6 text-xs text-slate-400 text-center space-y-1">
          <div>Demo users:</div>
          <div className="font-mono">
            lakshmi · priya · ramesh (wardens)
          </div>
          <div className="font-mono">suresh · sruthi (staff)</div>
          <div className="font-mono">rajesh · jaya (management)</div>
          <div>Password: <span className="font-mono">matrusri</span></div>
        </div>
      </form>
    </div>
  );
}
