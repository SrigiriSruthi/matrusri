import Link from "next/link";
import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { createUser } from "@/lib/actions";

export default async function NewUserPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await guardRole("management");
  const sp = await searchParams;
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const error = pick("error");
  const name = pick("name");
  const username = pick("username");
  const phone = pick("phone");
  const role = pick("role");
  const language = pick("language") || "en";

  return (
    <div className="min-h-screen">
      <PhoneHeader back="/management/settings/users" title="Add user" />
      <form action={createUser} className="p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded p-3">
            {error}
          </div>
        )}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Name *</label>
          <input name="name" defaultValue={name} required className="w-full border border-slate-300 rounded p-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Username * (lowercase, no spaces)</label>
          <input name="username" defaultValue={username} required pattern="[a-z0-9._-]+" className="w-full border border-slate-300 rounded p-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Phone *</label>
          <input name="phone" defaultValue={phone} required placeholder="+91 98xxx xxxxx" className="w-full border border-slate-300 rounded p-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Role *</label>
          <select name="role" defaultValue={role} required className="w-full border border-slate-300 rounded p-2 text-sm bg-white">
            <option value="">Pick…</option>
            <option value="warden">Warden</option>
            <option value="staff">Staff approver</option>
            <option value="management">Management</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Language *</label>
          <select name="language" defaultValue={language} required className="w-full border border-slate-300 rounded p-2 text-sm bg-white">
            <option value="en">English</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="hi">हिंदी (Hindi)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Initial password * (min 6 chars)</label>
          <input name="password" required minLength={6} type="text" placeholder="they can change it later" className="w-full border border-slate-300 rounded p-2 text-sm" />
          <div className="text-[11px] text-slate-500 mt-1">
            Give this to the user verbally. They can change it from their Profile.
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-800 text-white font-semibold py-3 rounded-lg">
          Save user
        </button>
        <Link
          href="/management/settings/users"
          className="block text-center bg-white text-blue-800 font-semibold py-3 rounded-lg border border-blue-800 no-underline"
        >
          Cancel
        </Link>
      </form>
    </div>
  );
}
