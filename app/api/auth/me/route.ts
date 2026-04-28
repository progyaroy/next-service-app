import { NextRequest } from "next/server";
import { successResponse, withErrorHandling } from "@/lib/api/response";
import { getUserFromRequest } from "@/lib/api/auth";
import { AuthenticationError } from "@/lib/errors/AppError";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";

// GET /api/auth/me
export const GET = withErrorHandling(async (req: NextRequest) => {
  const auth = await getUserFromRequest(req);
  if (!auth) throw new AuthenticationError();

  await connectDB();
  const user = await User.findById(auth.userId).lean() as any;
  if (!user) throw new AuthenticationError();

  return successResponse({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});
