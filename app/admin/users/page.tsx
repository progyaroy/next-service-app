import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";
import { DataTable } from "@/components/ui/data-table";

export const metadata = {
  title: "Users",
  description: "Manage users",
};

export default async function UsersPage() {
  await connectDB();
  const users = await User.find().sort({ createdAt: -1 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600 mt-1">Manage all users</p>
      </div>

      <DataTable
        columns={[
          { key: "email", label: "Email" },
          {
            key: "role",
            label: "Role",
            render: (value) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  value === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {value}
              </span>
            ),
          },
          {
            key: "createdAt",
            label: "Joined",
            render: (value) => new Date(value).toLocaleDateString(),
          },
        ]}
        data={JSON.parse(JSON.stringify(users))}
      />
    </div>
  );
}
