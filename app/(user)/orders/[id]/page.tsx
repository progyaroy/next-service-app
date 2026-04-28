import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import orderService from "@/lib/services/order.service";
import { Button, Card, CardContent, CardTitle } from "@/components/ui";

interface OrderDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const order = await orderService.getOrder(params.id, user.id);

  if (!order) {
    redirect("/orders");
  }

  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <Link href="/orders">
          <Button variant="ghost">← Back to Orders</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card>
            <CardTitle className="border-b p-4 text-lg">Order Status</CardTitle>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Order ID</p>
                  <p className="font-mono text-sm font-semibold">
                    {order._id.toString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Order Date</p>
                  <p className="text-sm font-semibold">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
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
                <div>
                  <p className="text-xs text-gray-600">Last Updated</p>
                  <p className="text-sm font-semibold">
                    {new Date(order.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardTitle className="border-b p-4 text-lg">Order Items</CardTitle>
            <CardContent className="divide-y pt-0">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between py-4 first:pt-4 last:pb-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {(item as any).itemType === "service" && (
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "var(--shop-rose-soft)", color: "var(--shop-rose-strong)" }}>
                          service
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">
                      ₹{item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardTitle className="border-b p-4 text-lg">
              Order Summary
            </CardTitle>
            <CardContent className="space-y-3 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg text-rose-600">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Link href="/orders">
                  <Button variant="ghost" className="w-full">
                    Back to Orders
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="primary" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card className="mt-6">
            <CardTitle className="border-b p-4 text-sm">
              Order Information
            </CardTitle>
            <CardContent className="space-y-2 pt-4 text-xs text-gray-600">
              <p>✓ Order placed successfully</p>
              <p>✓ Items are being prepared</p>
              <p>✓ You will receive updates via email</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
