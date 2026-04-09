export const metadata = {
  title: "Users",
  description: "Manage users",
};

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Users</h1>

      <div className="bg-white p-8 rounded-lg shadow text-center">
        <p className="text-gray-500">No users found</p>
      </div>
    </div>
  );
}
