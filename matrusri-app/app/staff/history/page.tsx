import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";

const STAFF_NAV = [
  { href: "/staff", icon: "✅", label: "Approvals" },
  { href: "/staff/history", icon: "📜", label: "History" },
  { href: "/staff/me", icon: "👤", label: "Me" },
];

const HISTORY = [
  { date: "Today",      items: [
    { name: "Ravi Kumar · Class 8",  type: "sick_pickup", note: "Fever, headache",         time: "6:32 pm", returned: null },
    { name: "Sreeja Reddy · Class 9", type: "special",     note: "Family event",            time: "6:38 pm", returned: null },
    { name: "Anil Kumar · Class 7",  type: "special",     note: "Doctor visit",            time: "4:12 pm", returned: "5:40 pm" },
  ]},
  { date: "Yesterday (27 Jun)", items: [
    { name: "Vishnu · Class 9",      type: "special",     note: "Doctor visit",            time: "11:00 am", returned: "1:30 pm" },
  ]},
  { date: "26 Jun (2nd Saturday)",  items: [
    { name: "Sneha · Class 7",       type: "regular",     note: "",                         time: "10:00 am", returned: "6:00 pm" },
    { name: "Aditya · Class 7",      type: "regular",     note: "",                         time: "10:15 am", returned: "5:45 pm" },
    { name: "Pooja · Class 6",       type: "regular",     note: "",                         time: "10:30 am", returned: "6:30 pm" },
  ]},
];

const TYPE_TAG: Record<string, string> = {
  sick_pickup: "🏥 Sick",
  special: "⚠️ Special",
  regular: "📅 Regular",
};

export default function StaffHistory() {
  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader back="/staff" title="History" subtitle="Past outings" />

      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex gap-2 text-xs overflow-x-auto">
        <span className="bg-white border border-slate-300 px-3 py-1 rounded-full text-slate-700">Pending (2)</span>
        <span className="bg-amber-500 text-white px-3 py-1 rounded-full">History</span>
      </div>

      <div className="p-4">
        <input
          type="text"
          placeholder="Search by student name…"
          className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm bg-white mb-4"
        />

        {HISTORY.map((day, di) => (
          <div key={di} className="mb-4">
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
              {day.date}
            </div>
            {day.items.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-3 mb-2"
              >
                <div className="flex justify-between items-start">
                  <div className="font-semibold text-sm">{item.name}</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {TYPE_TAG[item.type]}
                  </span>
                </div>
                {item.note && (
                  <div className="text-xs text-slate-500 mt-1">{item.note}</div>
                )}
                <div className="text-[11px] text-slate-500 mt-1">
                  Left {item.time}
                  {item.returned ? <> · Returned {item.returned} ✓</> : <> · <span className="text-amber-600">still out</span></>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <BottomNav items={STAFF_NAV} active="/staff/history" />
    </div>
  );
}
