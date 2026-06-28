import { redirect } from "next/navigation";
import { getCurrentUser, homePathForRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Landing() {
  const me = await getCurrentUser();
  if (me) {
    redirect(homePathForRole(me.role));
  }
  redirect("/login");
}
