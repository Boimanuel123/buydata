import { NextRequest, NextResponse } from "next/server";

// Protected routes that require authentication
const protectedRoutes = ["/dashboard", "/payment-success", "/activation-success", "/test"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Check for auth token in cookies (more reliable than localStorage)
    const firebaseToken = request.cookies.get("firebaseToken")?.value;
    const firebaseUid = request.cookies.get("firebaseUid")?.value;

    if (!firebaseToken || !firebaseUid) {
      console.log("[MIDDLEWARE] No auth token found, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    console.log("[MIDDLEWARE] Auth token found, allowing access to:", pathname);
  }

  // For login/register pages, redirect away if already authenticated
  if (pathname === "/login" || pathname === "/register") {
    const firebaseToken = request.cookies.get("firebaseToken")?.value;
    const firebaseUid = request.cookies.get("firebaseUid")?.value;

    if (firebaseToken && firebaseUid) {
      console.log("[MIDDLEWARE] User already authenticated, redirecting from", pathname, "to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
