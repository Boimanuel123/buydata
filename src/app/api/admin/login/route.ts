import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, SESSION_MAX_AGE, createAdminSession, credentialsMatch, isAdminConfigured } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json().catch(() => ({}));
  if (!isAdminConfigured() || !credentialsMatch(String(email || ""), String(password || ""))) {
    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, createAdminSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}
