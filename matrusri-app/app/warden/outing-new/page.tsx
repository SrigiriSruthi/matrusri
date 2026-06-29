import PhoneHeader from "@/components/PhoneHeader";
import OutingsTabs from "@/components/OutingsTabs";
import { guardRole } from "@/lib/guard";
import { getActiveStudents, getInFlightOutingsByStudent } from "@/lib/fetchers";
import OutingNewClient from "./OutingNewClient";

export const dynamic = "force-dynamic";

export default async function OutingNewPage() {
  await guardRole(["warden", "management"]);
  const [students, inFlight] = await Promise.all([
    getActiveStudents(),
    getInFlightOutingsByStudent(),
  ]);

  return (
    <div className="min-h-screen">
      <PhoneHeader back="/warden" title="Outings" subtitle="Send to staff approver" />
      <div className="p-4">
        <OutingsTabs active="new" />
        <OutingNewClient
          students={students.map((s) => {
            const f = inFlight.get(s.id);
            return {
              id: s.id,
              name: s.name,
              class: s.class,
              dorm: s.dorm,
              parent_name: s.parent_name,
              inFlight: f
                ? {
                    status: f.status,
                    expectedReturnAt: f.expectedReturnAt,
                  }
                : null,
            };
          })}
        />
      </div>
    </div>
  );
}
