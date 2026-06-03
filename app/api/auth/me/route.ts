import { NextRequest } from "next/server";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError } from "@/lib/errors/AppError";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";

type AuthUserView = {
  _id: { toString(): string };
  email: string;
  username?: string;
  name?: string;
  role: "user" | "admin";
  createdAt: Date;
};

// GET /api/auth/me
export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new AuthenticationError();

  await connectDB();
  const user = (await User.findById(auth.userId).lean()) as AuthUserView | null;
  if (!user) throw new AuthenticationError();

  return successResponse({
    id: user._id.toString(),
    email: user.email,
    username: user.username || user.email.split("@")[0],
    name: user.name || user.email.split("@")[0],
    role: user.role,
    createdAt: user.createdAt,
  });
});
