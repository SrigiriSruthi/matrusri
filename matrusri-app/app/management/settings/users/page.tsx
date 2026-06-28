import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { getAllUsers } from "@/lib/fetchers";
import { toggleUserActive } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function UsersAdmin() {
  await guardRole("management");
  const users = await getAllUsers();

  return (
    <div className="min-h-screen">
      <PhoneHeader back="/management/settings" title="Users" subtitle={`${users.filter(u => u.is_active).length} active`} />

      <div className="p-4">
        <Link
          href="/management/settings/users/new"
          className="block w-full bg-blue-800 text-white text-center font-semibold py-3 rounded-lg mb-4 no-underline"
        >
          ➕ Add user
        </Link>

        {users.map((u) => (
          <div key={u.id} className={`bg-white border border-slate-200 rounded-xl p-3 mb-2 flex items-center ${!u.is_active ? "opacity-60" : ""}`}>
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center mr-3 shrink-0">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">
                {u.name} <span className="text-xs text-slate-400 ml-1">@{u.username}</span>
              </div>
              <div className="text-xs text-slate-500">
                {u.role} · {u.phone}
              </div>
            </div>
            <form action={async () => { "use server"; await toggleUserActive(u.id, !u.is_active); }}>
              <button type="submit" className={`text-xs underline ml-2 ${u.is_active ? "text-red-700" : "text-emerald-700"}`}>
                {u.is_active ? "Deactivate" : "Reactivate"}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
