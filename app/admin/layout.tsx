import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-sm text-gray-400 mt-1">{user.email}</p>
        </div>

        <nav className="space-y-2">
          <Link
            href="/admin"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Products
          </Link>
          <Link
            href="/admin/categories"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Categories
          </Link>
          <Link
            href="/admin/services"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Services
          </Link>
          <Link
            href="/admin/orders"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Orders
          </Link>
          <Link
            href="/admin/users"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Users
          </Link>
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
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
