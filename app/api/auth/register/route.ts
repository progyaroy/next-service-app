import { NextRequest } from "next/server";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { ConflictError, ValidationError } from "@/lib/errors/AppError";
import { connectDB } from "@/lib/db/mongoose";
import { hashPassword } from "@/lib/auth/password";
import { getSecretKey } from "@/lib/api/auth";
import User from "@/lib/models/User";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

const COOKIE_NAME = "parlour_session";

// POST /api/auth/register
export const POST = withErrorHandling(async (req: NextRequest) => {
  const { email, password } = await req.json();

  if (!email || !email.includes("@")) throw new ValidationError("Valid email is required");
  if (!password || password.length < 8) throw new ValidationError("Password must be at least 8 characters");

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ConflictError("An account with this email already exists");

  const passwordHash = hashPassword(password);
  const user = await User.create({ email: email.toLowerCase(), passwordHash, role: "user" });

  const token = await new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user._id.toString())
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());

  const res = successResponse({ id: user._id.toString(), email: user.email, role: user.role }, 201);
  const response = NextResponse.json(await res.json(), { status: 201 });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  return response;
});
