import { redirect } from "next/navigation";
import ChatFeature from "@/features/chat";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = {
  title: "Chat",
  description: "Real-time one-to-one chat",
};

export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <ChatFeature currentUserId={user.id} />;
}
