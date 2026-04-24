import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import orderService from "@/lib/services/order.service";
import { Button } from "@/components/ui";
import Link from "next/link";

const COOKIE_NAME = "parlour_session";

function getSecretKey(): Uint8Array {
  const raw = process.env.AUTH_SECRET;
  if (raw && raw.length >= 32) {
    return new TextEncoder().encode(raw);
  }
  if (process.env.NODE_ENV === "development") {
    return new TextEncoder().encode("dev-insecure-parlour-secret-min-32-chars!");
  }
  throw new Error("AUTH_SECRET is required in production");
}

async function getUserIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.sub as string;
  } catch (error) {
    console.error("[Order Confirmation] Token verification failed:", error);
    return null;
  }
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = await getUserIdFromCookie();

  if (!userId) {
    redirect("/login");
  }

  const order = await orderService.getOrder(params.id, userId);

  if (!order) {
    redirect("/orders");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <div className="mb-4 text-5xl">✓</div>
        <h1 className="mb-2 text-3xl font-bold text-green-900">
          Order Confirmed!
        </h1>
        <p className="text-green-700">
          Thank you for your order. Your order has been successfully placed.
        </p>
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Order Details</h2>

        <div className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Order ID</span>
            <span className="font-mono font-semibold">{order._id.toString()}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Order Date</span>
            <span>
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Status</span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              {order.status}
            </span>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 font-semibold">Items</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount</span>
              <span className="text-rose-600">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <Link href="/orders" className="flex-1">
          <Button className="w-full" variant="primary">
            View All Orders
          </Button>
        </Link>
        <Link href="/products" className="flex-1">
          <Button className="w-full" variant="secondary">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
