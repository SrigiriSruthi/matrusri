import PhoneHeader from "@/components/PhoneHeader";

const ENTRIES = [
  { time: "6:38 pm", icon: "🚪", title: "Outing started: Sreeja (Class 9)", meta: "⚠️ Special-day · Family event · Approved by Suresh", status: "ok" },
  { time: "6:32 pm", icon: "🏥", title: "Outing started: Ravi (Class 8)",   meta: "Sick pickup · Fever, headache · OTP + Lakshmi approved", status: "ok" },
  { time: "5:00 pm", icon: "🚰", title: "Water pump OFF — MISSED",          meta: "Window closed without photo · Warden: Lakshmi", status: "missed" },
  { time: "4:30 pm", icon: "🤒", title: "Sick logged: Anusha (Class 6)",    meta: "Stomach ache · parent not yet called", status: "warn" },
  { time: "2:30 pm", icon: "🍛", title: "Lunch wastage 🟡 Medium",          meta: "Priya · photo attached", status: "ok" },
  { time: "2:15 pm", icon: "🔢", title: "Attendance #3 — Lunch verified ✓",  meta: "Priya & Lakshmi counts matched · 143 present", status: "ok" },
  { time: "10:45 am",icon: "🔢", title: "Attendance #2 — School interval",   meta: "Priya · Boys 82/85, Girls 63/65", status: "ok" },
  { time: "9:12 am", icon: "🍳", title: "Breakfast wastage 🟢 Low",          meta: "Priya · photo attached", status: "ok" },
  { time: "6:42 am", icon: "🔒", title: "Room lock confirmed",               meta: "Tap done · Lakshmi", status: "ok" },
  { time: "6:35 am", icon: "🔢", title: "Attendance #1 — Study hall",        meta: "Lakshmi · Boys 83/85, Girls 64/65", status: "ok" },
  { time: "6:04 am", icon: "🚰", title: "Bore pump OFF",                     meta: "Duration 1h 2m · within tolerance ✓", status: "ok" },
  { time: "5:40 am", icon: "🧘", title: "Yoga photo uploaded",               meta: "Suresh · photo attached", status: "ok" },
  { time: "5:08 am", icon: "💡", title: "Lights/fans/main OFF",              meta: "Tap done · Lakshmi", status: "ok" },
  { time: "5:02 am", icon: "🚰", title: "Bore pump ON",                      meta: "Lakshmi · photo attached", status: "ok" },
];

export default function ActivityLog() {
  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader back="/management" title="Activity log" subtitle="Sun 28 Jun · all events" />

      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex gap-2 text-xs overflow-x-auto">
        <span className="bg-blue-800 text-white px-3 py-1 rounded-full whitespace-nowrap">All</span>
        <span className="bg-white border border-slate-300 px-3 py-1 rounded-full text-slate-700 whitespace-nowrap">Tasks</span>
        <span className="bg-white border border-slate-300 px-3 py-1 rounded-full text-slate-700 whitespace-nowrap">Attendance</span>
        <span className="bg-white border border-slate-300 px-3 py-1 rounded-full text-slate-700 whitespace-nowrap">Sick</span>
        <span className="bg-white border border-slate-300 px-3 py-1 rounded-full text-slate-700 whitespace-nowrap">Outings</span>
        <span className="bg-white border border-slate-300 px-3 py-1 rounded-full text-slate-700 whitespace-nowrap">Pumps</span>
      </div>

      <div className="p-4">
        {ENTRIES.map((e, i) => {
          const bar =
            e.status === "missed"
              ? "border-l-red-500"
              : e.status === "warn"
              ? "border-l-amber-500"
              : "border-l-emerald-500";
          const dim = e.status === "ok" ? "opacity-95" : "";
          return (
            <div
              key={i}
              className={`bg-white border border-slate-200 border-l-4 ${bar} rounded-xl p-3 mb-2 flex items-start ${dim}`}
            >
              <div className="text-xl mr-3">{e.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{e.title}</div>
                <div className="text-xs text-slate-500">{e.meta}</div>
              </div>
              <div className="text-[11px] text-slate-500 ml-2 whitespace-nowrap">
                {e.time}
              </div>
            </div>
          );
        })}

        <div className="text-[11px] text-slate-400 text-center mt-4">
          Older than 30 days: text remains, photos auto-deleted.
        </div>
      </div>
    </div>
  );
}
