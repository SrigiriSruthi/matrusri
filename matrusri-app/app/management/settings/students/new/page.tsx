import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { createStudent } from "@/lib/actions";

const CLASS_OPTIONS = [
  "1st", "2nd", "3rd", "4th", "5th",
  "6th", "7th", "8th", "9th", "10th",
  "6th IIT", "7th IIT", "8th IIT", "9th IIT",
];

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
        <div>
          <label className="block text-xs text-slate-500 mb-1">Class *</label>
          <select name="class" required defaultValue="" className="w-full border border-slate-300 rounded p-2 text-sm bg-white">
            <option value="" disabled>Pick a class…</option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Gender *</label>
          <select name="gender" required defaultValue="" className="w-full border border-slate-300 rounded p-2 text-sm bg-white">
            <option value="" disabled>Pick…</option>
            <option value="boy">Boy</option>
            <option value="girl">Girl</option>
          </select>
        </div>
        <div className="h-px bg-slate-200" />
        <div>
          <label className="block text-xs text-slate-500 mb-1">Mother&apos;s name *</label>
          <input name="parent_name" required className="w-full border border-slate-300 rounded p-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Father&apos;s phone number *</label>
          <input name="parent_phone" required placeholder="+91 98xxx xxxxx" className="w-full border border-slate-300 rounded p-2 text-sm" />
          <div className="text-[11px] text-slate-500 mt-1">Primary contact for OTPs and emergencies</div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Mother&apos;s phone number (optional)</label>
          <input name="emergency_contact_phone" placeholder="+91 98xxx xxxxx" className="w-full border border-slate-300 rounded p-2 text-sm" />
          <div className="text-[11px] text-slate-500 mt-1">Backup contact if father is unreachable</div>
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
