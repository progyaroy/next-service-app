import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/account");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>

        <nav className="space-y-2 px-4">
          <Link
            href="/admin"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Products
          </Link>
          <Link
            href="/admin/categories"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Categories
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <Link
            href="/account"
            className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
          >
            My Account
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
