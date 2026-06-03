import { NextRequest } from "next/server";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { AuthenticationError, ValidationError } from "@/lib/errors/AppError";
import { connectDB } from "@/lib/db/mongoose";
import { verifyPassword } from "@/lib/auth/password";
import { getSecretKey } from "@/lib/api/auth";
import User from "@/lib/models/User";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

const COOKIE_NAME = "parlour_session";

// POST /api/auth/login
export const POST = withErrorHandling(async (req: NextRequest) => {
  const { email, password, rememberMe } = await req.json();

  if (!email || !password) throw new ValidationError("Email and password are required");

  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new AuthenticationError("Invalid email or password");
  }

  const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;

  const token = await new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user._id.toString())
    .setIssuedAt()
    .setExpirationTime(`${sessionDuration}s`)
    .sign(getSecretKey());

  const user_data = { id: user._id.toString(), email: user.email, role: user.role };
  const payload = { user: user_data, token : token };
  const res = successResponse(payload);
  const response = NextResponse.json(await res.json(), { status: 200 });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: sessionDuration,
    path: "/",
  });
  return response;
});
