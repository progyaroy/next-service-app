import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "parlour_session";

function getSecretKey(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (raw && raw.length >= 32) {
    return new TextEncoder().encode(raw);
  }
  if (process.env.NODE_ENV === "development") {
    return new TextEncoder().encode("dev-insecure-parlour-secret-min-32-chars!");
  }
  throw new Error(
    "AUTH_SECRET is required in production (min 32 characters). Add it to .env.local."
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ IMPORTANT: skip middleware for RSC / internal requests
  const isRSC =
    request.headers.get("next-router-prefetch") ||
    request.headers.get("rsc") ||
    request.headers.get("x-nextjs-data");

  if (isRSC) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const allCookies = request.cookies.getAll();

  console.log("[MIDDLEWARE] Request to:", pathname);
  console.log("[MIDDLEWARE] All cookies:", allCookies.map(c => c.name));
  console.log("[MIDDLEWARE] Token found:", !!token);

  if (!token) {
    console.log("[MIDDLEWARE] No token found for path:", pathname);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    console.log("[MIDDLEWARE] Verifying token for path:", pathname);
    const { payload } = await jwtVerify(token, getSecretKey());

    const role = payload.role as string | undefined;

    if (!role) {
      throw new Error("Invalid token payload - no role");
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/account", request.url));
    }

    console.log("[MIDDLEWARE] Token verified successfully for user with role:", role);
    return NextResponse.next();
  } catch (err) {
    console.error("[MIDDLEWARE] JWT ERROR:", err);

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path*",
    "/account/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};