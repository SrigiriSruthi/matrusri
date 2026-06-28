import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { getAllUsers } from "@/lib/fetchers";
import UsersClient from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersAdmin() {
  const me = await guardRole("management");
  const users = await getAllUsers();

  return (
    <div className="min-h-screen">
      <PhoneHeader
        back="/management/settings"
        title="Users"
        subtitle={`${users.filter((u) => u.is_active).length} active · ${users.length} total`}
      />

      <div className="p-4">
        <Link
          href="/management/settings/users/new"
          className="block w-full bg-blue-800 text-white text-center font-semibold py-3 rounded-lg mb-4 no-underline"
        >
          ➕ Add user
        </Link>

        <UsersClient
          currentUserId={me.id}
          users={users.map((u) => ({
            id: u.id,
            name: u.name,
            username: u.username,
            phone: u.phone,
            role: u.role as "warden" | "staff" | "management",
            is_active: u.is_active,
          }))}
        />
      </div>
    </div>
  );
}
