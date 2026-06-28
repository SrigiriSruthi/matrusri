import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import { guardRole } from "@/lib/guard";

export const dynamic = "force-dynamic";

const WARDEN_NAV = [
  { href: "/warden", icon: "📋", label: "Tasks" },
  { href: "/warden/outing-new", icon: "🚪", label: "New outing" },
  { href: "/warden/sick", icon: "🤒", label: "Sick" },
  { href: "/warden/laundry", icon: "🧺", label: "Laundry" },
  { href: "/warden/me", icon: "👤", label: "Me" },
];

type Row = {
  name: string;
  meta: string;
  action: "give" | "hold" | "done" | "complaint";
  done?: string;
};

const PENDING: Row[] = [
  { name: "Anil Kumar · Class 7 · Dorm A", meta: "Roll 0023 · 3 items expected", action: "give" },
  { name: "Sreeja Reddy · Class 9 · Dorm B", meta: "Roll 0089 · 4 items expected · ⚠️ on outing", action: "hold" },
  { name: "Kiran · Class 9 · Dorm B", meta: "Roll 0091 · 2 items expected · 🛏 sick (resting)", action: "give" },
  { name: "Priyanka · Class 8 · Dorm B", meta: "Roll 0034 · 5 items expected", action: "give" },
];

const DONE: Row[] = [
  { name: "Ramya · Class 6", meta: "3 items given · 9:05 pm", action: "done", done: "Undo" },
  { name: "Aditya · Class 7", meta: "4 items given · 9:04 pm · ⚠️ 1 missing reported", action: "complaint", done: "View" },
];

export default async function Laundry() {
  await guardRole(["warden", "management"]);
  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader back="/warden" title="Laundry" subtitle="Batch #14 · in distribution" />

      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex gap-2 text-xs overflow-x-auto">
        <span className="bg-blue-800 text-white px-3 py-1 rounded-full whitespace-nowrap">Distribution</span>
        <span className="bg-white border border-slate-300 px-3 py-1 rounded-full text-slate-700 whitespace-nowrap">Pickup</span>
        <span className="bg-white border border-slate-300 px-3 py-1 rounded-full text-slate-700 whitespace-nowrap">Return</span>
        <span className="bg-white border border-slate-300 px-3 py-1 rounded-full text-slate-700 whitespace-nowrap">Complaints</span>
      </div>

      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded mb-4">
          ⏰ Window: 9:00 – 9:30 pm · Now 9:08 pm · 142 items across 47 students
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 mb-4 flex justify-between items-center">
          <div>
            <div className="text-xs text-slate-500">Batch #14</div>
            <div className="font-bold">Vendor: Krishna Laundry</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-500">Distributed</div>
            <div className="text-2xl font-bold text-emerald-600">18 / 47</div>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search student by name or roll no…"
          className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm bg-white mb-4"
        />

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
          Pending distribution
        </div>

        {PENDING.map((r, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 mb-2 flex items-center">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-2 shrink-0">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{r.name}</div>
              <div className="text-xs text-slate-500 truncate">{r.meta}</div>
            </div>
            {r.action === "give" ? (
              <button className="bg-emerald-600 text-white text-xs font-semibold py-2 px-3 rounded-lg ml-2 shrink-0">
                ✓ Give
              </button>
            ) : (
              <button className="bg-white text-blue-800 text-xs font-semibold py-2 px-3 rounded-lg border border-blue-800 ml-2 shrink-0">
                Hold
              </button>
            )}
          </div>
        ))}

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mt-4 mb-2">
          Distributed today
        </div>

        {DONE.map((r, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 mb-2 flex items-center opacity-75">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-2 shrink-0">
              ✓
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{r.name}</div>
              <div className="text-xs text-slate-500 truncate">{r.meta}</div>
            </div>
            <button className="bg-white text-blue-800 text-xs font-semibold py-2 px-3 rounded-lg border border-blue-800 ml-2 shrink-0">
              {r.done}
            </button>
          </div>
        ))}

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800">
          ⚠️ Any pending students at 9:30 pm will be auto-marked{" "}
          <strong>&ldquo;unclaimed (N items)&rdquo;</strong> and held for next morning&apos;s redistribution.
        </div>
      </div>

      <BottomNav items={WARDEN_NAV} active="/warden/laundry" />
    </div>
  );
}
