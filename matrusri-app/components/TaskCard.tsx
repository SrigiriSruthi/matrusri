import Link from "next/link";
import type { Task } from "@/lib/types";
import { t, type Lang } from "@/lib/i18n";

const BADGE: Record<Task["status"], { key: string; classes: string; bar: string }> = {
  done: { key: "Done", classes: "bg-green-100 text-green-800", bar: "" },
  open: { key: "Open now", classes: "bg-blue-100 text-blue-800", bar: "border-l-4 border-amber-500" },
  missed: { key: "Missed", classes: "bg-red-100 text-red-800", bar: "border-l-4 border-red-500" },
  upcoming: { key: "Upcoming", classes: "bg-slate-100 text-slate-500", bar: "" },
};

export default function TaskCard({ task, href, lang = "en" }: { task: Task; href?: string; lang?: Lang }) {
  const badge = BADGE[task.status];
  const dim = task.status === "done" || task.status === "missed";
  const card = (
    <div
      className={`bg-white border border-slate-200 rounded-xl p-3 mb-2 flex items-center ${badge.bar} ${
        dim ? "opacity-70" : ""
      }`}
    >
      {task.icon && (
        <div className="text-2xl mr-2 shrink-0 leading-none">{task.icon}</div>
      )}
      <div className="w-16 text-xs text-slate-500 font-semibold shrink-0">{task.time}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">
          {task.status === "done" ? "✓ " : ""}
          {task.name}
        </div>
        <div className="text-xs text-slate-500 truncate">{task.meta}</div>
      </div>
      <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase ml-2 shrink-0 ${badge.classes}`}>
        {t(badge.key, lang)}
      </span>
    </div>
  );
  if (href) {
    return <Link href={href} className="block no-underline text-inherit">{card}</Link>;
  }
  return card;
}
