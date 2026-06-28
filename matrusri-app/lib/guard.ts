import { redirect } from "next/navigation";
import { getCurrentUser, homePathForRole, type SessionUser } from "./auth";

/**
 * Use at the top of a server-component page to ensure the user is logged in
 * and has the required role. Redirects otherwise.
 */
export async function guardRole(
  required: SessionUser["role"] | SessionUser["role"][]
): Promise<SessionUser> {
  const u = await getCurrentUser();
  if (!u) {
    redirect("/login");
  }
  const allowed = Array.isArray(required) ? required : [required];
  if (!allowed.includes(u.role)) {
    // logged in but wrong role — bounce to their own home
    redirect(homePathForRole(u.role));
  }
  return u;
}
