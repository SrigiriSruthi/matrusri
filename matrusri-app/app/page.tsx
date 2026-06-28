import Link from "next/link";
import { HOSTEL_NAME } from "@/data/seed";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-blue-800 text-white text-center py-12 px-6">
        <div className="text-5xl mb-3">🏠</div>
        <h1 className="text-2xl font-bold">{HOSTEL_NAME}</h1>
        <p className="text-sm opacity-85 mt-1">Hostel management — daily operations</p>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <p className="text-sm text-slate-600 mb-4">
          Demo build — pick a role to preview their app. In the real app, login routes
          you to the right home automatically.
        </p>

        <div className="space-y-3">
          <Link href="/management" className="block bg-blue-800 text-white text-center font-semibold py-4 rounded-lg no-underline">
            👑 Management — Today dashboard
          </Link>
          <Link href="/warden" className="block bg-emerald-600 text-white text-center font-semibold py-4 rounded-lg no-underline">
            🧑‍🏫 Warden — Today&apos;s tasks
          </Link>
          <Link href="/staff" className="block bg-amber-500 text-white text-center font-semibold py-4 rounded-lg no-underline">
            ✅ Staff — Approvals inbox
          </Link>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <Link href="/login" className="block text-center text-sm text-slate-500 underline">
            View the real login flow (welcome → OTP → PIN)
          </Link>
        </div>
      </div>
    </div>
  );
}
