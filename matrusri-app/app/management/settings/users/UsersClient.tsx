"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleUserActive } from "@/lib/actions";

type User = {
  id: string;
  name: string;
  username: string;
  phone: string;
  role: "warden" | "staff" | "management";
  is_active: boolean;
};

const ROLE_LABEL: Record<User["role"], string> = {
  warden: "Warden",
  staff: "Staff approver",
  management: "Management",
};

export default function UsersClient({
  currentUserId,
  users,
}: {
  currentUserId: string;
  users: User[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(u: User) {
    const verb = u.is_active ? "deactivate" : "reactivate";
    if (!confirm(`${verb[0].toUpperCase() + verb.slice(1)} ${u.name}?`)) return;
    setBusyId(u.id);
    setError(null);
    setFlash(null);
    try {
      await toggleUserActive(u.id, !u.is_active);
      if (!u.is_active) {
        setFlash(`${u.name} reactivated.`);
      } else if (u.role === "warden") {
        setFlash(`${u.name} deactivated. Their tasks were auto-reassigned to another warden.`);
      } else {
        setFlash(`${u.name} deactivated.`);
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {flash && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded p-3 mb-3">
          {flash}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded p-3 mb-3">
          {error}
        </div>
      )}

      {users.map((u) => {
        const isSelf = u.id === currentUserId;
        return (
          <div
            key={u.id}
            className={`bg-white border border-slate-200 rounded-xl p-3 mb-2 flex items-center ${
              !u.is_active ? "opacity-60" : ""
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center mr-3 shrink-0">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">
                {u.name}
                <span className="text-xs text-slate-400 ml-1">@{u.username}</span>
                {isSelf && <span className="text-[10px] text-blue-700 ml-2">(you)</span>}
              </div>
              <div className="text-xs text-slate-500">
                {ROLE_LABEL[u.role]} · {u.phone}
              </div>
            </div>
            {!isSelf && (
              <button
                onClick={() => toggle(u)}
                disabled={busyId === u.id}
                className={`text-xs underline ml-2 ${
                  u.is_active ? "text-red-700" : "text-emerald-700"
                } disabled:opacity-50`}
              >
                {busyId === u.id ? "…" : u.is_active ? "Deactivate" : "Reactivate"}
              </button>
            )}
          </div>
        );
      })}

      <div className="text-[11px] text-slate-400 text-center mt-3">
        Deactivating a warden auto-reassigns their tasks to another active warden.
        <br />
        Audit history is preserved — past actions still show their name.
      </div>
    </div>
  );
}
