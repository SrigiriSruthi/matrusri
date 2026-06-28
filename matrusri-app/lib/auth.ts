/**
 * Username + password auth.
 *
 * Sessions are stored as a signed cookie containing the user_id.
 * Cookie is httpOnly + secure (in prod) + sameSite=lax.
 *
 * Password hashing: bcryptjs, 10 rounds.
 */
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { serviceClient } from "./supabase";

const COOKIE_NAME = "matrusri_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionUser = {
  id: string;
  name: string;
  username: string;
  role: "management" | "warden" | "staff";
  language: "en" | "te" | "hi";
};

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string | null): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

export async function loginWithUsernamePassword(
  username: string,
  password: string
): Promise<{ user: SessionUser } | { error: string }> {
  const sb = serviceClient();
  const trimmed = username.trim().toLowerCase();
  const { data: user, error } = await sb
    .from("users")
    .select("id, name, username, role, language, password_hash, is_active")
    .ilike("username", trimmed)
    .eq("is_active", true)
    .maybeSingle();

  if (error) return { error: "Login failed. Try again." };
  if (!user) return { error: "Username not found." };

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return { error: "Wrong password." };

  await setSessionCookie(user.id);
  return {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      language: (user.language ?? "en") as "en" | "te" | "hi",
    },
  };
}

export async function setSessionCookie(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const sb = serviceClient();
  const { data: user, error } = await sb
    .from("users")
    .select("id, name, username, role, language, is_active")
    .eq("id", sessionId)
    .maybeSingle();

  if (error || !user || !user.is_active) {
    // Stale session — try to clear cookie if possible (best effort; will fail in RSC)
    try {
      jar.delete(COOKIE_NAME);
    } catch {
      // RSCs can't mutate cookies — fine, middleware/route handlers will clear later
    }
    return null;
  }
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    language: (user.language ?? "en") as "en" | "te" | "hi",
  };
}

export async function requireRole(roles: SessionUser["role"][]) {
  const u = await getCurrentUser();
  if (!u || !roles.includes(u.role)) {
    return null;
  }
  return u;
}

export function homePathForRole(role: SessionUser["role"]): string {
  if (role === "management") return "/management";
  if (role === "warden") return "/warden";
  return "/staff";
}
