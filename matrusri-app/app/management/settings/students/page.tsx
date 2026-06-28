import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { getStudents } from "@/lib/fetchers";
import { toggleStudentActive } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function StudentsAdmin() {
  await guardRole("management");
  const students = await getStudents();
  const active = students.filter((s) => s.is_active);
  const inactive = students.filter((s) => !s.is_active);
  const boys = active.filter((s) => s.gender === "boy").length;
  const girls = active.filter((s) => s.gender === "girl").length;

  return (
    <div className="min-h-screen">
      <PhoneHeader back="/management/settings" title="Students" subtitle={`${active.length} active`} />

      <div className="p-4">
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded mb-4">
          ✅ Live from Supabase · {boys} boys · {girls} girls
        </div>

        <Link
          href="/management/settings/students/new"
          className="block w-full bg-blue-800 text-white text-center font-semibold py-3 rounded-lg mb-4 no-underline"
        >
          ➕ Add student
        </Link>

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
          Active students ({active.length})
        </div>

        {active.map((s) => (
          <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-3 mb-2 flex items-center">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center mr-3 shrink-0">
              {s.gender === "boy" ? "👦" : "👧"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">
                {s.name} · Class {s.class} · Dorm {s.dorm}
              </div>
              <div className="text-xs text-slate-500 truncate">
                Roll {s.roll_no} · {s.parent_name} · {s.parent_phone}
              </div>
            </div>
            <form action={async () => { "use server"; await toggleStudentActive(s.id, false); }}>
              <button type="submit" className="text-xs text-red-700 underline ml-2">
                Deactivate
              </button>
            </form>
          </div>
        ))}

        {inactive.length > 0 && (
          <>
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mt-6 mb-2">
              Inactive ({inactive.length})
            </div>
            {inactive.map((s) => (
              <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-2 flex items-center opacity-60">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center mr-3 shrink-0">
                  {s.gender === "boy" ? "👦" : "👧"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{s.name}</div>
                </div>
                <form action={async () => { "use server"; await toggleStudentActive(s.id, true); }}>
                  <button type="submit" className="text-xs text-emerald-700 underline ml-2">
                    Reactivate
                  </button>
                </form>
              </div>
            ))}
          </>
        )}

        {students.length === 0 && (
          <div className="text-center text-sm text-slate-500 mt-8">
            No students yet. Tap &ldquo;Add student&rdquo; to start.
          </div>
        )}
      </div>
    </div>
  );
}
