import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";

const WARDEN_NAV = [
  { href: "/warden", icon: "📋", label: "Tasks" },
  { href: "/warden/outing-new", icon: "🚪", label: "New outing" },
  { href: "/warden/sick", icon: "🤒", label: "Sick" },
  { href: "/warden/laundry", icon: "🧺", label: "Laundry" },
  { href: "#me", icon: "👤", label: "Me" },
];

export default function SickBay() {
  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader back="/warden" title="Sick Bay" subtitle="4 active cases" />

      <div className="p-4">
        <button className="w-full bg-blue-800 text-white font-semibold py-4 rounded-lg mb-4">
          ➕ Add sick student
        </button>

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
          Active
        </div>

        {/* Ravi — parent not called over 1 hr */}
        <div className="bg-white border border-slate-200 border-l-4 border-l-red-500 rounded-xl p-4 mb-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold">Ravi · Class 8</div>
              <div className="text-xs text-slate-500">Fever, headache</div>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full font-semibold uppercase bg-red-100 text-red-800">
              Call parent
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Reported at 4:30 pm · 1 hr 12 min ago
          </div>
          <div className="mt-2 bg-red-50 rounded p-2 text-xs text-red-700">
            🔴 Over 1 hour — parent must be called now
          </div>
          <div className="mt-2 bg-slate-50 rounded p-2 text-xs space-y-1">
            <div>📞 Mother (Sujatha): <span className="text-blue-700">+91 98xxx xxxxx</span></div>
            <div>📞 Emergency (Uncle Ramesh): <span className="text-blue-700">+91 97xxx xxxxx</span></div>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-lg">
              📞 Primary called
            </button>
            <button className="flex-1 bg-white text-blue-800 text-sm font-semibold py-2.5 rounded-lg border border-blue-800">
              📞 Emergency called
            </button>
          </div>
        </div>

        {/* Anusha — parent called, awaiting outcome */}
        <div className="bg-white border border-slate-200 border-l-4 border-l-amber-500 rounded-xl p-4 mb-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold">Anusha · Class 6</div>
              <div className="text-xs text-slate-500">Stomach ache</div>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full font-semibold uppercase bg-blue-100 text-blue-800">
              Parent called
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Reported at 3:15 pm · Parent called 3:45 pm
          </div>
          <div className="text-sm font-semibold mt-3">Pick outcome:</div>
          <div className="flex flex-wrap gap-2 mt-2">
            <button className="flex-1 min-w-[48%] bg-white text-blue-800 text-sm font-semibold py-2.5 rounded-lg border border-blue-800">
              🛏 Resting in hostel
            </button>
            <button className="flex-1 min-w-[48%] bg-white text-blue-800 text-sm font-semibold py-2.5 rounded-lg border border-blue-800">
              🏠 Sent home
            </button>
            <button className="flex-1 min-w-[48%] bg-white text-blue-800 text-sm font-semibold py-2.5 rounded-lg border border-blue-800">
              🏥 Sent to doctor
            </button>
            <button className="flex-1 min-w-[48%] bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-lg">
              ✓ Recovered
            </button>
          </div>
          <div className="text-[11px] text-slate-400 text-center mt-2">
            &quot;Sent home&quot; requires OTP + staff approval (same as any outing)
          </div>
        </div>

        {/* Kiran — day 2 resting */}
        <div className="bg-white border border-slate-200 border-l-4 border-l-indigo-500 rounded-xl p-4 mb-3 opacity-85">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold">Kiran · Class 9</div>
              <div className="text-xs text-slate-500">Cold · 🛏 Resting in hostel</div>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full font-semibold uppercase bg-green-100 text-green-800">
              Resting
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2">Day 2 · Parent informed</div>
        </div>

        {/* Lahari — sent home earlier */}
        <div className="bg-white border border-slate-200 border-l-4 border-l-indigo-500 rounded-xl p-4 mb-3 opacity-85">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold">Lahari · Class 7</div>
              <div className="text-xs text-slate-500">Fever · 🏠 Sent home 2:00 pm</div>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full font-semibold uppercase bg-green-100 text-green-800">
              Sent home
            </span>
          </div>
        </div>
      </div>

      <BottomNav items={WARDEN_NAV} active="/warden/sick" />
    </div>
  );
}
