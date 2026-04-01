import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  try {
    const auth = request.cookies.get("mh_auth")?.value;
    const isAuthed = auth === "1";
    const { pathname } = request.nextUrl;

    const isProtected =
      pathname === "/account" ||
      pathname.startsWith("/account/") ||
      pathname === "/my-bookings" ||
      pathname.startsWith("/onboarding/") ||
      pathname === "/book/details" ||
      pathname === "/book/review" ||
      pathname === "/booking/success" ||
      pathname.startsWith("/invoice/") ||
      pathname.startsWith("/my-bookings/");

    if (!isProtected) return NextResponse.next();
    if (isAuthed) return NextResponse.next();

    const login = new URL("/login", request.url);
    login.searchParams.set("redirect", pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  } catch {
    try {
      return NextResponse.redirect(new URL("/login", request.url));
    } catch {
      return NextResponse.next();
    }
  }
}

export const config = {
  matcher: [
    "/book/details",
    "/book/review",
    "/booking/success",
    "/account",
    "/account/:path*",
    "/onboarding/:path*",
    "/my-bookings",
    "/invoice/:path*",
    "/my-bookings/:path*",
  ],
};
