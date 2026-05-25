import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Flask OAuth sets the cookie and redirects here after login
// This route just forwards to dashboard
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/auth/login?error=${error}`, request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
