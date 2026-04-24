"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

interface CheckoutFormProps {
  orderId: string;
  totalAmount: number;
}

export default function CheckoutForm({
  orderId,
  totalAmount,
}: CheckoutFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Order is already created, just redirect to confirmation
      router.push(`/order-confirmation/${orderId}`);
    } catch (err) {
      console.error("[Checkout] Error:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
        <div className="flex justify-between text-sm font-medium">
          <span>Total Amount</span>
          <span className="text-lg text-rose-600">
            ${totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
        variant="primary"
      >
        {isLoading ? "Processing..." : "Place Order"}
      </Button>
    </form>
  );
}
