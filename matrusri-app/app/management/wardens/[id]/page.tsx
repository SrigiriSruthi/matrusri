import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";

type WardenDay = {
  name: string;
  phone: string;
  done: number;
  total: number;
  missed: number;
  open: number;
  upcoming: number;
  weekScore: number;
  monthScore: number;
  tasks: Array<{ time: string; name: string; status: "done" | "open" | "missed" | "upcoming"; meta: string }>;
};

const WARDENS: Record<string, WardenDay> = {
  lakshmi: {
    name: "Lakshmi Devi",
    phone: "+91 98xxx xxxxx",
    done: 4, total: 4, missed: 0, open: 0, upcoming: 0,
    weekScore: 100, monthScore: 97,
    tasks: [
      { time: "5:00 am",  name: "Lights/fans/main OFF",       status: "done", meta: "Tap done · 5:08 am" },
      { time: "5:00 am",  name: "Bore pump ON",               status: "done", meta: "Photo · 5:02 am" },
      { time: "6:30 am",  name: "Attendance #1 — Study hall", status: "done", meta: "Boys 83/85 · Girls 64/65 · 6:35 am" },
      { time: "6:30 am",  name: "Room lock confirmation",     status: "done", meta: "Tap done · 6:42 am" },
    ],
  },
  priya: {
    name: "Priya Sharma",
    phone: "+91 98xxx xxxxx",
    done: 2, total: 4, missed: 1, open: 1, upcoming: 0,
    weekScore: 79, monthScore: 84,
    tasks: [
      { time: "9:00 am",  name: "Breakfast wastage photo",     status: "done",   meta: "🟢 Low · 9:12 am" },
      { time: "10:00 am", name: "Attendance #2",               status: "done",   meta: "Submitted · 10:45 am" },
      { time: "5:00 pm",  name: "Water pump OFF photo",        status: "missed", meta: "Window closed 7:00 pm" },
      { time: "6:00 pm",  name: "Attendance #4",               status: "open",   meta: "Window: 6:00 – 8:00 pm · 18 min left" },
    ],
  },
  suresh: {
    name: "Suresh Kumar",
    phone: "+91 98xxx xxxxx",
    done: 1, total: 2, missed: 0, open: 0, upcoming: 1,
    weekScore: 96, monthScore: 94,
    tasks: [
      { time: "5:30 am",  name: "Yoga photo",                  status: "done",     meta: "Uploaded · 5:40 am" },
      { time: "9:00 pm",  name: "Dining + Learning hall photos", status: "upcoming", meta: "9:00 – 11:00 pm · 2 photos" },
    ],
  },
  ramesh: {
    name: "Ramesh Naidu",
    phone: "+91 98xxx xxxxx",
    done: 1, total: 2, missed: 0, open: 0, upcoming: 1,
    weekScore: 89, monthScore: 91,
    tasks: [
      { time: "8:00 am",  name: "Breakfast attendance (opt)",  status: "done",     meta: "Optional · skipped" },
      { time: "9:30 pm",  name: "Attendance #5 — Day close",   status: "upcoming", meta: "9:30 – 11:00 pm" },
    ],
  },
};

const STATUS_BADGE: Record<string, string> = {
  done: "bg-green-100 text-green-800",
  open: "bg-blue-100 text-blue-800",
  missed: "bg-red-100 text-red-800",
  upcoming: "bg-slate-100 text-slate-500",
};

export default async function WardenDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const w = WARDENS[id];

  if (!w) {
    return (
      <div className="min-h-screen">
        <PhoneHeader back="/management/wardens" title="Not found" />
        <div className="p-4 text-sm text-slate-500">
          Warden &ldquo;{id}&rdquo; not found.
          <Link href="/management/wardens" className="block mt-3 text-blue-700 underline">
            ← Back to wardens
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PhoneHeader back="/management/wardens" title={w.name} subtitle="Today · 28 Jun" />

      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${w.weekScore >= 90 ? "text-emerald-600" : w.weekScore >= 80 ? "text-amber-600" : "text-red-600"}`}>
              {w.done}/{w.total}
            </div>
            <div className="text-[11px] text-slate-500">Today</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${w.weekScore >= 90 ? "text-emerald-600" : w.weekScore >= 80 ? "text-amber-600" : "text-red-600"}`}>
              {w.weekScore}%
            </div>
            <div className="text-[11px] text-slate-500">Week</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${w.monthScore >= 90 ? "text-emerald-600" : w.monthScore >= 80 ? "text-amber-600" : "text-red-600"}`}>
              {w.monthScore}%
            </div>
            <div className="text-[11px] text-slate-500">Month</div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <a href={`tel:${w.phone.replace(/\s+/g, "")}`} className="flex-1 bg-emerald-600 text-white text-center font-semibold py-3 rounded-lg no-underline">
            📞 Call
          </a>
          <a href={`sms:${w.phone.replace(/\s+/g, "")}`} className="flex-1 bg-blue-800 text-white text-center font-semibold py-3 rounded-lg no-underline">
            💬 Message
          </a>
        </div>

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
          Today&apos;s assigned tasks
        </div>
        {w.tasks.map((t, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 mb-2 flex items-center">
            <div className="w-16 text-xs text-slate-500 font-semibold shrink-0">{t.time}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{t.name}</div>
              <div className="text-xs text-slate-500 truncate">{t.meta}</div>
            </div>
            <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase ml-2 shrink-0 ${STATUS_BADGE[t.status]}`}>
              {t.status === "open" ? "Open" : t.status}
            </span>
          </div>
        ))}

        <div className="text-[11px] text-slate-400 text-center mt-4">
          {w.phone}
        </div>
      </div>
    </div>
  );
}
