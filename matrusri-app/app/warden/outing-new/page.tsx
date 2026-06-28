import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { getActiveStudents } from "@/lib/fetchers";
import OutingNewClient from "./OutingNewClient";

export const dynamic = "force-dynamic";

export default async function OutingNewPage() {
  await guardRole(["warden", "management"]);
  const students = await getActiveStudents();
  return (
    <div className="min-h-screen">
      <PhoneHeader back="/warden" title="Request outing" subtitle="Send to staff approver" />
      <div className="p-4">
        <OutingNewClient students={students.map((s) => ({ id: s.id, name: s.name, class: s.class, dorm: s.dorm, parent_name: s.parent_name }))} />
      </div>
    </div>
  );
}
