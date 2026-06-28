import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

async function logout(req: NextRequest) {
  await clearSessionCookie();
  const url = new URL("/login", req.url);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(req: NextRequest) {
  return logout(req);
}

// Allow GET for simpler "sign out" links
export async function GET(req: NextRequest) {
  return logout(req);
}
