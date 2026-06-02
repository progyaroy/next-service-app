"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ShippingForm, { ShippingAddress } from "@/features/payment/shipping-form";
import CheckoutForm from "@/features/payment/checkout-form";
import { Card, CardContent, CardTitle } from "@/components/ui";

interface CheckoutResponse {
  orderId: string;
  totalAmount: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShippingSubmit = async (shippingAddress: ShippingAddress) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "Failed to create order"
        );
      }

      const data: CheckoutResponse = await response.json();
      setCheckoutData(data);
      setStep("payment");
    } catch (err) {
      console.error("[Payment Page] Checkout error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process checkout"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-between">
        <div
          className={`flex items-center ${
            step === "shipping" ? "text-rose-600" : "text-gray-400"
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step === "shipping"
                ? "bg-rose-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            1
          </div>
          <span className="ml-2 text-sm font-medium">Shipping</span>
        </div>

        <div className={`flex-1 border-t-2 ${step === "payment" ? "border-rose-600" : "border-gray-200"}`} />

        <div
          className={`flex items-center ${
            step === "payment" ? "text-rose-600" : "text-gray-400"
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step === "payment"
                ? "bg-rose-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            2
          </div>
          <span className="ml-2 text-sm font-medium">Order</span>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === "shipping" ? (
            <ShippingForm
              onSubmit={handleShippingSubmit}
              isLoading={isLoading}
            />
          ) : checkoutData ? (
            <CheckoutForm
              orderId={checkoutData.orderId}
              totalAmount={checkoutData.totalAmount}
            />
          ) : null}
        </div>

        {/* Order Summary */}
        {checkoutData && (
          <div>
            <Card>
              <CardTitle className="border-b p-4 text-lg">
                Order Summary
              </CardTitle>
              <CardContent className="space-y-3 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-mono text-xs">
                    {checkoutData.orderId.slice(0, 8)}...
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-lg text-rose-600">
                      ${checkoutData.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
