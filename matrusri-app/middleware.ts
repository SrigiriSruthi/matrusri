import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/warden", "/management", "/staff"];

const ROLE_FOR_PREFIX: Record<string, string> = {
  "/warden": "warden",
  "/management": "management",
  "/staff": "staff",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard known role prefixes
  const prefix = PROTECTED_PREFIXES.find((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!prefix) return NextResponse.next();

  // Check session cookie presence
  const session = req.cookies.get("matrusri_session")?.value;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Role enforcement happens server-side on each page via getCurrentUser().
  // Middleware just blocks anonymous access.
  return NextResponse.next();
}

export const config = {
  matcher: ["/warden/:path*", "/management/:path*", "/staff/:path*"],
};
