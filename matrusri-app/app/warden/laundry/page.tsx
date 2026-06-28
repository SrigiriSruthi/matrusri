import PhoneHeader from "@/components/PhoneHeader";
import BottomNav from "@/components/BottomNav";
import { guardRole } from "@/lib/guard";
import { serviceClient } from "@/lib/supabase";
import LaundryClient from "./LaundryClient";

export const dynamic = "force-dynamic";

const WARDEN_NAV = [
  { href: "/warden", icon: "📋", label: "Tasks" },
  { href: "/warden/outing-new", icon: "🚪", label: "New outing" },
  { href: "/warden/sick", icon: "🤒", label: "Sick" },
  { href: "/warden/laundry", icon: "🧺", label: "Laundry" },
  { href: "/warden/me", icon: "👤", label: "Me" },
];

async function getLaundryState() {
  const sb = serviceClient();
  const { data, error } = await sb
    .from("laundry_state")
    .select("pending_count, last_updated_at, last_updated_by, last_updater:users!last_updated_by(name)")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    // Table may not exist yet (migration not run)
    return null;
  }
  return data as {
    pending_count: number;
    last_updated_at: string;
    last_updated_by: string | null;
    last_updater: { name: string } | null;
  } | null;
}

export default async function LaundryPage() {
  await guardRole(["warden", "management"]);
  const state = await getLaundryState();

  return (
    <div className="min-h-screen pb-24">
      <PhoneHeader back="/warden" title="Laundry" subtitle="Pending pickup" />

      <div className="p-4">
        <LaundryClient
          pendingCount={state?.pending_count ?? 0}
          lastUpdatedAt={state?.last_updated_at ?? null}
          lastUpdatedBy={state?.last_updater?.name ?? null}
          available={state !== null}
        />
      </div>

      <BottomNav items={WARDEN_NAV} active="/warden/laundry" />
    </div>
  );
}
