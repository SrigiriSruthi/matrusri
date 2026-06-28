import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import MgmtTabBar from "@/components/MgmtTabBar";

const MGMT_NAV = [
  { href: "/management", icon: "📊", label: "Today" },
  { href: "/management/trends", icon: "📈", label: "Trends" },
  { href: "/management/wardens", icon: "👥", label: "Wardens" },
  { href: "/management/settings", icon: "⚙️", label: "Settings" },
];

const WARDENS_TODAY = [
  { id: "lakshmi",  name: "Lakshmi", done: 4, total: 4, missed: 0, open: 0, status: "ok"      as const, weekScore: 100 },
  { id: "priya",    name: "Priya",   done: 2, total: 4, missed: 1, open: 1, status: "danger"  as const, weekScore: 79  },
  { id: "suresh",   name: "Suresh",  done: 1, total: 2, missed: 0, open: 0, status: "ok"      as const, weekScore: 96  },
  { id: "ramesh",   name: "Ramesh",  done: 1, total: 2, missed: 0, open: 0, status: "ok"      as const, weekScore: 89  },
];

export default function WardensPage() {
  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader back="/management" title="Wardens" subtitle="Today's progress" />
      <MgmtTabBar active="/management/wardens" />

      <div className="p-4">
        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
          Today
        </div>
        {WARDENS_TODAY.map((w) => {
          const border =
            w.status === "danger"
              ? "border-l-red-500 bg-red-50"
              : "border-l-emerald-500";
          return (
            <Link
              key={w.id}
              href={`/management/wardens/${w.id}`}
              className="block no-underline text-inherit"
            >
              <div
                className={`bg-white border border-slate-200 border-l-4 ${border} rounded-xl p-3 mb-2 flex items-center`}
              >
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center mr-3">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{w.name}</div>
                  <div className="text-xs text-slate-500">
                    {w.done}/{w.total} done
                    {w.missed > 0 && (
                      <>
                        {" "}
                        · <span className="text-red-600">🔴 {w.missed} missed</span>
                      </>
                    )}
                    {w.open > 0 && (
                      <>
                        {" "}
                        · <span className="text-amber-700">🟡 {w.open} open</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-xs text-slate-500">Week: <strong>{w.weekScore}%</strong></span>
              </div>
            </Link>
          );
        })}

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mt-6 mb-2">
          Reliability — this week
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          {[...WARDENS_TODAY]
            .sort((a, b) => b.weekScore - a.weekScore)
            .map((w, i, arr) => (
              <div
                key={w.id}
                className={`flex justify-between items-center py-2 ${
                  i < arr.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <span className="text-sm">
                  {i + 1}. {w.name}
                </span>
                <span
                  className={`text-sm font-bold ${
                    w.weekScore >= 90
                      ? "text-emerald-600"
                      : w.weekScore >= 80
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {w.weekScore}%
                </span>
              </div>
            ))}
        </div>
      </div>

      <BottomNav items={MGMT_NAV} active="/management/wardens" />
    </div>
  );
}
