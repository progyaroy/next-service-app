import { NextRequest } from "next/server";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError, AuthorizationError } from "@/lib/errors/AppError";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";

type AdminUserView = {
  _id: { toString(): string };
  email: string;
  username?: string;
  name?: string;
  role: "user" | "admin";
  createdAt: Date;
};

// GET /api/admin/users (admin only)
export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new AuthenticationError();
  if (auth.role !== "admin") throw new AuthorizationError();

  await connectDB();
  const users = (await User.find({})
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .lean()) as AdminUserView[];

  return successResponse({
    users: users.map((u) => ({
      id: u._id.toString(),
      email: u.email,
      username: u.username || u.email.split("@")[0],
      name: u.name || u.email.split("@")[0],
      role: u.role,
      createdAt: u.createdAt,
    })),
    count: users.length,
  });
});
