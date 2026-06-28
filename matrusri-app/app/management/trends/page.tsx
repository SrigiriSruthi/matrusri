import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import MgmtTabBar from "@/components/MgmtTabBar";
import { guardRole } from "@/lib/guard";

export const dynamic = "force-dynamic";

const MGMT_NAV = [
  { href: "/management", icon: "📊", label: "Today" },
  { href: "/management/trends", icon: "📈", label: "Trends" },
  { href: "/management/wardens", icon: "👥", label: "Wardens" },
  { href: "/management/settings", icon: "⚙️", label: "Settings" },
];

const WASTAGE_WEEK = [
  { day: "Mon", b: "Low", l: "Low",    s: "Low",    d: "Low" },
  { day: "Tue", b: "Low", l: "High",   s: "Low",    d: "Med" },
  { day: "Wed", b: "Low", l: "Med",    s: "Low",    d: "—"   },
  { day: "Thu", b: "Med", l: "Low",    s: "Low",    d: "Low" },
  { day: "Fri", b: "Low", l: "High",   s: "Med",    d: "Low" },
  { day: "Sat", b: "Low", l: "Med",    s: "Low",    d: "Low" },
  { day: "Sun", b: "—",   l: "—",      s: "Low",    d: "—"   },
];

function tagColor(v: string) {
  if (v === "Low") return "bg-emerald-100 text-emerald-700";
  if (v === "Med") return "bg-amber-100 text-amber-700";
  if (v === "High") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-400";
}

export default async function TrendsPage() {
  await guardRole("management");
  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader back="/management" title="Trends" subtitle="This week · 22 Jun – 28 Jun" />
      <MgmtTabBar active="/management/trends" />

      <div className="p-4 space-y-5">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
            Weekly summary
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <div className="text-xs text-slate-500">Tasks missed</div>
              <div className="text-2xl font-bold">7</div>
              <div className="text-[11px] text-red-600">↑ 2 vs last week</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <div className="text-xs text-slate-500">Attendance avg</div>
              <div className="text-2xl font-bold">96%</div>
              <div className="text-[11px] text-emerald-600">↑ 1% vs last week</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <div className="text-xs text-slate-500">Sick episodes</div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-[11px] text-slate-500">9 resting, 3 home</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3">
              <div className="text-xs text-slate-500">Laundry complaints</div>
              <div className="text-2xl font-bold">3</div>
              <div className="text-[11px] text-slate-500">Krishna Laundry</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
            Food wastage by meal (Mon–Sun)
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-2">Day</th>
                  <th className="pb-2">B</th>
                  <th className="pb-2">L</th>
                  <th className="pb-2">S</th>
                  <th className="pb-2">D</th>
                </tr>
              </thead>
              <tbody>
                {WASTAGE_WEEK.map((d) => (
                  <tr key={d.day} className="border-t border-slate-100">
                    <td className="py-2 font-semibold">{d.day}</td>
                    {[d.b, d.l, d.s, d.d].map((v, i) => (
                      <td key={i} className="py-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${tagColor(v)}`}>
                          {v}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-[11px] text-slate-500 mt-2">
              Pattern: <strong>Tue + Fri lunch consistently high</strong> — consider menu change.
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
            Sick frequency (top 5)
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-sm space-y-2">
            <div className="flex justify-between"><span>Ravi (Class 8)</span><strong>3 episodes</strong></div>
            <div className="flex justify-between"><span>Anusha (Class 6)</span><strong>2 episodes</strong></div>
            <div className="flex justify-between"><span>Kiran (Class 9)</span><strong>2 episodes</strong></div>
            <div className="flex justify-between"><span>Lahari (Class 7)</span><strong>1 episode</strong></div>
            <div className="flex justify-between"><span>Aditya (Class 7)</span><strong>1 episode</strong></div>
          </div>
        </div>
      </div>

      <BottomNav items={MGMT_NAV} active="/management/trends" />
    </div>
  );
}
