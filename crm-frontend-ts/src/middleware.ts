// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const token = request.cookies.get("token");

  // No token? Only allow "/"
  if (!token && pathname !== "/") {
    return NextResponse.redirect(new URL("/", origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to routes *without* a file extension,
    // and exclude Next.js internals
    "/((?!api|_next/static|_next/image|.*\\..*).*)",
  ],
};
