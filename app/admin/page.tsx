import { connectDB } from "@/lib/db/mongoose";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import User from "@/lib/models/User";

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard",
};

export default async function AdminDashboard() {
  await connectDB();

  const productCount = await Product.countDocuments();
  const categoryCount = await Category.countDocuments();
  const userCount = await User.countDocuments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Total Products
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{productCount}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Total Categories
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{categoryCount}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Total Users
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{userCount}</p>
        </div>
      </div>
    </div>
  );
}
