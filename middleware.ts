import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "parlour_session";

function buildCorsHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  const origin = request.headers.get("origin");

  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
  } else {
    headers.set("Access-Control-Allow-Origin", "*");
  }

  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );
  headers.set("Access-Control-Max-Age", "86400");

  return headers;
}

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

  // Allow API access from any origin/port and handle preflight requests globally.
  if (pathname.startsWith("/api")) {
    const corsHeaders = buildCorsHeaders(request);

    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const response = NextResponse.next();
    corsHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  // ✅ IMPORTANT: skip middleware for RSC / internal requests
  const isRSC =
    request.headers.get("next-router-prefetch") ||
    request.headers.get("rsc") ||
    request.headers.get("x-nextjs-data");

  if (isRSC) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Allow unauthenticated access to login/register
  if (pathname === "/login" || pathname === "/register") {
    // If user is authenticated, redirect to home
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Allow unauthenticated users to access these pages
    return NextResponse.next();
  }

  // For all other protected routes, require authentication
  if (!token) {
    console.log("[MIDDLEWARE] No token found for path:", pathname);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    const role = payload.role as string | undefined;

    if (!role) {
      throw new Error("Invalid token payload - no role");
    }

    // Admins cannot access user-facing shop routes
    const isUserOnlyRoute =
      pathname.startsWith("/cart") ||
      pathname.startsWith("/payment") ||
      pathname.startsWith("/order") ||
      pathname.startsWith("/account") ||
      pathname.startsWith("/chat");

    if (role === "admin" && isUserOnlyRoute) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Non-admins cannot access admin routes
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/account", request.url));
    }

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
    "/api/:path*",
    "/admin/:path*",
    "/account/:path*",
    "/cart/:path*",
    "/cart",
    "/payment/:path*",
    "/orders/:path*",
    "/order-confirmation/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/chat/:path*",
    "/chat",
    "/login",
    "/register",
  ],
};