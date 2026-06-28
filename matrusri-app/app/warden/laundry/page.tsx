import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import { guardRole } from "@/lib/guard";
import { getOpenLaundryIssues, getActiveStudents } from "@/lib/fetchers";
import LaundryClient from "./LaundryClient";

export const dynamic = "force-dynamic";

const WARDEN_NAV = [
  { href: "/warden", icon: "📋", label: "Tasks" },
  { href: "/warden/outing-new", icon: "🚪", label: "New outing" },
  { href: "/warden/sick", icon: "🤒", label: "Sick" },
  { href: "/warden/laundry", icon: "🧺", label: "Laundry" },
  { href: "/warden/me", icon: "👤", label: "Me" },
];

export default async function LaundryPage() {
  await guardRole(["warden", "management"]);
  const issues = await getOpenLaundryIssues();
  const students = await getActiveStudents();

  type Issue = {
    id: string;
    item_count: number;
    issue_type: string;
    note: string | null;
    created_at: string;
    student: { name: string; class: string; dorm: string } | null;
    creator: { name: string } | null;
  };

  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader back="/warden" title="Laundry" subtitle={`${issues.length} open issue${issues.length === 1 ? "" : "s"}`} />

      <div className="p-4">
        <LaundryClient
          issues={(issues as unknown as Issue[]) ?? []}
          students={students.map((s) => ({ id: s.id, name: s.name, class: s.class }))}
          tableAvailable={true}
        />
      </div>

      <BottomNav items={WARDEN_NAV} active="/warden/laundry" />
    </div>
  );
}
