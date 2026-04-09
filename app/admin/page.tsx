export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-600 text-sm font-medium">Total Products</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-600 text-sm font-medium">Total Categories</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-600 text-sm font-medium">Total Users</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Welcome to Admin Panel</h2>
        <p className="text-gray-600">
          Use the sidebar to manage products and categories.
        </p>
      </div>
    </div>
  );
}
