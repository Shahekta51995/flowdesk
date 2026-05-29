import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const session     = req.cookies.get("flowdesk_session")?.value;
  const isLoggedIn  = !!session;
  const path        = req.nextUrl.pathname;

  const isDashboard = path.startsWith("/dashboard");
  const isUserApp   = path.startsWith("/app");
  const isLoginPage = path === "/login";

  // Not logged in → redirect to login
  if ((isDashboard || isUserApp) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn) {
    try {
      const userData = JSON.parse(session!);
      const isAdmin  = userData.user?.isAdmin;

      // Admin trying to access user pages → redirect to dashboard
      if (isUserApp && isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // User trying to access admin pages → redirect to /app
      if (isDashboard && !isAdmin) {
        return NextResponse.redirect(new URL("/app", req.url));
      }

      // Already logged in and on login page → redirect to correct home
      if (isLoginPage) {
        return NextResponse.redirect(
          new URL(isAdmin ? "/dashboard" : "/app", req.url)
        );
      }
    } catch {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};