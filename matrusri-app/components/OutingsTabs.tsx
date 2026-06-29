import Link from "next/link";

export default function OutingsTabs({
  active,
  newCount,
  outCount,
}: {
  active: "new" | "out";
  newCount?: number;
  outCount?: number;
}) {
  const baseTab =
    "flex-1 text-center py-2.5 text-sm font-semibold rounded-lg";
  const activeCls = "bg-blue-800 text-white";
  const idleCls = "bg-slate-100 text-slate-700";
  return (
    <div className="flex gap-2 mb-4">
      <Link
        href="/warden/outing-new"
        className={`${baseTab} ${active === "new" ? activeCls : idleCls}`}
      >
        ➕ New request{typeof newCount === "number" ? ` (${newCount})` : ""}
      </Link>
      <Link
        href="/warden/outing-return"
        className={`${baseTab} ${active === "out" ? activeCls : idleCls}`}
      >
        🚪 Out now{typeof outCount === "number" ? ` (${outCount})` : ""}
      </Link>
    </div>
  );
}
