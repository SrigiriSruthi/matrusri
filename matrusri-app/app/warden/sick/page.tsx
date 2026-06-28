import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import { guardRole } from "@/lib/guard";
import { getActiveSickLogs, getActiveStudents } from "@/lib/fetchers";
import SickBayClient from "./SickBayClient";

export const dynamic = "force-dynamic";

const WARDEN_NAV = [
  { href: "/warden", icon: "📋", label: "Tasks" },
  { href: "/warden/outing-new", icon: "🚪", label: "New outing" },
  { href: "/warden/sick", icon: "🤒", label: "Sick" },
  { href: "/warden/laundry", icon: "🧺", label: "Laundry" },
  { href: "/warden/me", icon: "👤", label: "Me" },
];

export default async function SickBayPage() {
  await guardRole(["warden", "management"]);
  const sickLogs = await getActiveSickLogs();
  const students = await getActiveStudents();

  type Row = {
    id: string;
    symptoms: string;
    reported_at: string;
    parent_called_at: string | null;
    emergency_called_at: string | null;
    outcome: string | null;
    student: {
      name: string;
      class: string;
      parent_name: string;
      parent_phone: string;
      emergency_contact_name: string | null;
      emergency_contact_phone: string | null;
    } | null;
  };

  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader back="/warden" title="Sick Bay" subtitle={`${sickLogs.length} active`} />

      <div className="p-4">
        <SickBayClient
          sickLogs={(sickLogs as unknown as Row[]) ?? []}
          students={students.map((s) => ({ id: s.id, name: s.name, class: s.class }))}
        />
      </div>

      <BottomNav items={WARDEN_NAV} active="/warden/sick" />
    </div>
  );
}
