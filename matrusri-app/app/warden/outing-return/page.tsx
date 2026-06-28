import PhoneHeader from "@/components/PhoneHeader";
import { guardRole } from "@/lib/guard";
import { getActiveOutings } from "@/lib/fetchers";
import { serviceClient } from "@/lib/supabase";
import OutingReturnClient from "./OutingReturnClient";

export const dynamic = "force-dynamic";

async function getApprovedAtGate() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("outings")
    .select(`
      id, type, reason, reason_note, expected_return_at, approved_at,
      student:students(name, class, dorm),
      approver:users!approved_by(name)
    `)
    .eq("status", "pending_gate")
    .order("approved_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export default async function OutingReturnPage() {
  await guardRole(["warden", "management"]);
  const active = await getActiveOutings();
  const atGate = await getApprovedAtGate();

  type OutingRow = {
    id: string;
    type: "regular" | "special" | "sick_pickup";
    reason: string | null;
    reason_note: string | null;
    expected_return_at: string | null;
    started_at: string | null;
    approved_at: string | null;
    student: { name: string; class: string; dorm: string } | null;
    approver: { name: string } | null;
  };

  return (
    <div className="min-h-screen">
      <PhoneHeader
        back="/warden"
        title="Outings"
        subtitle={`${atGate.length} at gate · ${active.length} out`}
      />

      <div className="p-4">
        <OutingReturnClient
          atGate={(atGate as unknown as OutingRow[]) ?? []}
          active={(active as unknown as OutingRow[]) ?? []}
        />
      </div>
    </div>
  );
}
