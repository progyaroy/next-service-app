import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">{user.email}</p>
        </div>

        <nav className="space-y-2">
          <Link
            href="/account"
            className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Account
          </Link>
          <Link
            href="/orders"
            className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Orders
          </Link>
          <Link
            href="/profile"
            className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Profile
          </Link>
          <Link
            href="/settings"
            className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Settings
          </Link>
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
