import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const session     = req.cookies.get("flowdesk_session")?.value;
  const isLoggedIn  = !!session;
  const path        = req.nextUrl.pathname;

  const isDashboard = path.startsWith("/dashboard");
  const isApp       = path.startsWith("/app");
  const isLoginPage = path === "/login";

  if ((isDashboard || isApp) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoginPage && isLoggedIn) {
    try {
      const userData = JSON.parse(session!);
      const dest     = userData.user?.isAdmin ? "/dashboard" : "/app";
      return NextResponse.redirect(new URL(dest, req.url));
    } catch {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};