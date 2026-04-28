import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import orderService from "@/lib/services/order.service";
import { Button, Card, CardContent, CardTitle } from "@/components/ui";

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const orders = await orderService.getUserOrders(user.id);

  if (orders.length === 0) {
    return (
      <div className="max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">My Orders</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-gray-600">You haven't placed any orders yet</p>
            <Link href="/products">
              <Button variant="primary">Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <h1 className="mb-8 text-3xl font-bold">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order._id.toString()}>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-4">
                {/* Order ID */}
                <div>
                  <p className="text-xs text-gray-600">Order ID</p>
                  <p className="font-mono text-sm font-semibold">
                    {order._id.toString().slice(0, 8)}...
                  </p>
                </div>

                {/* Date */}
                <div>
                  <p className="text-xs text-gray-600">Order Date</p>
                  <p className="text-sm font-semibold">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs text-gray-600">Status</p>
                  <p
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </p>
                </div>

                {/* Total */}
                <div>
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-sm font-semibold text-rose-600">
                    ₹{order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-xs font-semibold text-gray-600">
                  Items ({order.items.length})
                </p>
                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-700">
                      {item.name} × {item.quantity} @ ₹{item.price.toFixed(2)}
                      {(item as any).itemType === "service" && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--shop-rose-soft)", color: "var(--shop-rose-strong)" }}>
                          service
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              </div>

              {/* View Details Link */}
              <div className="mt-4">
                <Link href={`/orders/${order._id.toString()}`}>
                  <Button variant="ghost" className="text-sm">
                    View Details →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
