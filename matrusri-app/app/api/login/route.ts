import { NextRequest, NextResponse } from "next/server";
import { loginWithUsernamePassword, homePathForRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required." }, { status: 400 });
  }

  const result = await loginWithUsernamePassword(username, password);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json({
    user: result.user,
    redirectTo: homePathForRole(result.user.role),
  });
}
