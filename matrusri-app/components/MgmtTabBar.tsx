import Link from "next/link";

const TABS = [
  { href: "/management", label: "Today" },
  { href: "/management/trends", label: "This week" },
  { href: "/management/wardens", label: "Wardens" },
  { href: "/management/settings", label: "Settings" },
];

export default function MgmtTabBar({ active }: { active: string }) {
  return (
    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex gap-2 overflow-x-auto text-xs">
      {TABS.map((t) => {
        const on = t.href === active;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-3 py-1 rounded-full whitespace-nowrap no-underline ${
              on
                ? "bg-blue-800 text-white"
                : "bg-white border border-slate-300 text-slate-700"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
