import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import orderService from "@/lib/services/order.service";
import { Card, CardContent, CardTitle } from "@/components/ui";

export default async function AdminOrdersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/");
  }

  const orders = await orderService.getAllOrders();

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold">All Orders</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No orders yet</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

  return (
    <div className="max-w-7xl">
      <h1 className="mb-8 text-3xl font-bold">All Orders</h1>

      {/* Statistics */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{totalRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-blue-600">{completedOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs text-gray-600">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{cancelledOrders}</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardTitle className="border-b p-6 text-lg">Orders List</CardTitle>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id.toString()} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">
                      {order._id.toString().slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {typeof order.userId === "object" && order.userId !== null && "email" in order.userId
                        ? (order.userId as any).email
                        : "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      {order.items.some((i: any) => i.itemType === "service") && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--shop-rose-soft)", color: "var(--shop-rose-strong)" }}>
                          has services
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-rose-600">
                      ₹{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
