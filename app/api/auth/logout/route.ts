import { successResponse, withErrorHandling } from "@/lib/api/response";
import { NextResponse } from "next/server";

const COOKIE_NAME = "parlour_session";

// POST /api/auth/logout
export const POST = withErrorHandling(async () => {
  const res = successResponse({ loggedOut: true });
  const response = NextResponse.json(await res.json(), { status: 200 });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
});
