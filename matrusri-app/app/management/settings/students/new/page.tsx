import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { createStudent } from "@/lib/actions";

export default async function NewStudentPage() {
  await guardRole("management");
  return (
    <div className="min-h-screen">
      <PhoneHeader back="/management/settings/students" title="Add student" />
      <form action={createStudent} className="p-4 space-y-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Name *</label>
          <input name="name" required className="w-full border border-slate-300 rounded p-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Roll no</label>
            <input name="roll_no" className="w-full border border-slate-300 rounded p-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Class *</label>
            <input name="class" required className="w-full border border-slate-300 rounded p-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Dorm *</label>
            <input name="dorm" required className="w-full border border-slate-300 rounded p-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Gender *</label>
            <select name="gender" required className="w-full border border-slate-300 rounded p-2 text-sm bg-white">
              <option value="">Pick…</option>
              <option value="boy">Boy</option>
              <option value="girl">Girl</option>
            </select>
          </div>
        </div>
        <div className="h-px bg-slate-200" />
        <div>
          <label className="block text-xs text-slate-500 mb-1">Parent name *</label>
          <input name="parent_name" required className="w-full border border-slate-300 rounded p-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Parent phone *</label>
          <input name="parent_phone" required placeholder="+91 98xxx xxxxx" className="w-full border border-slate-300 rounded p-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Emergency contact name</label>
          <input name="emergency_contact_name" className="w-full border border-slate-300 rounded p-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Emergency contact phone</label>
          <input name="emergency_contact_phone" className="w-full border border-slate-300 rounded p-2 text-sm" />
        </div>

        <button type="submit" className="w-full bg-blue-800 text-white font-semibold py-3 rounded-lg">
          Save student
        </button>
        <Link
          href="/management/settings/students"
          className="block text-center bg-white text-blue-800 font-semibold py-3 rounded-lg border border-blue-800 no-underline"
        >
          Cancel
        </Link>
      </form>
    </div>
  );
}
