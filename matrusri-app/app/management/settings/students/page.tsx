import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import { getStudents } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function StudentsAdmin() {
  const students = await getStudents();

  const byGender = students.reduce(
    (acc, s) => {
      if (s.gender === "boy") acc.boys++;
      else if (s.gender === "girl") acc.girls++;
      return acc;
    },
    { boys: 0, girls: 0 }
  );

  return (
    <div className="min-h-screen">
      <PhoneHeader back="/management/settings" title="Students" subtitle={`${students.length} active`} />

      <div className="p-4">
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded mb-4">
          ✅ Loaded from Supabase live · {byGender.boys} boys · {byGender.girls} girls
        </div>

        <Link
          href="#"
          className="block w-full bg-blue-800 text-white text-center font-semibold py-3 rounded-lg mb-4 no-underline"
        >
          ➕ Add student
        </Link>

        <input
          type="text"
          placeholder="Search by name, roll no, parent…"
          className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm bg-white mb-4"
        />

        <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">
          All students
        </div>

        {students.map((s) => (
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
            <span className="text-slate-400 ml-2">›</span>
          </div>
        ))}

        {students.length === 0 && (
          <div className="text-center text-sm text-slate-500 mt-8">
            No students yet. Tap &ldquo;Add student&rdquo; to start.
          </div>
        )}
      </div>
    </div>
  );
}
