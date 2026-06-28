import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import { guardRole } from "@/lib/guard";
import { getPendingApprovals } from "@/lib/fetchers";
import StaffApprovalsClient from "./StaffApprovalsClient";

export const dynamic = "force-dynamic";

const STAFF_NAV = [
  { href: "/staff", icon: "✅", label: "Approvals" },
  { href: "/staff/history", icon: "📜", label: "History" },
  { href: "/staff/me", icon: "👤", label: "Me" },
];

export default async function StaffPage() {
  const me = await guardRole(["staff", "management"]);
  const pending = await getPendingApprovals();

  type Row = {
    id: string;
    type: "regular" | "special" | "sick_pickup";
    reason: string | null;
    reason_note: string | null;
    created_at: string;
    expected_return_at: string | null;
    student: { name: string; class: string; dorm: string } | null;
    requester: { name: string } | null;
  };

  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader
        back="/"
        title="Outing Requests"
        subtitle={`${me.name} · Staff approver`}
      />

      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex gap-2 text-xs">
        <span className="bg-amber-500 text-white px-3 py-1 rounded-full">Pending ({pending.length})</span>
      </div>

      <div className="p-4">
        <StaffApprovalsClient pending={(pending as unknown as Row[]) ?? []} />
      </div>

      <BottomNav items={STAFF_NAV} active="/staff" />
    </div>
  );
}
