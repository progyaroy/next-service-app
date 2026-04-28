"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";

interface IncludedProduct {
  productId: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface Service {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  totalPrice: number;
  includedProducts: IncludedProduct[];
}

interface ServicesProps {
  services: Service[];
}

const serviceGradients = [
  "from-rose-200 to-pink-300",
  "from-purple-200 to-violet-300",
  "from-amber-200 to-orange-300",
  "from-teal-200 to-cyan-300",
  "from-indigo-200 to-blue-300",
  "from-emerald-200 to-green-300",
];

function getGradient(id: string) {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return serviceGradients[Math.abs(hash) % serviceGradients.length];
}

export default function Services({ services }: ServicesProps) {
  if (services.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Our Services</h1>
          <p className="text-gray-600 mt-2">Discover our professional parlour services</p>
        </div>
        <Card className="p-12 text-center">
          <p className="text-gray-600">No services available yet</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Our Services</h1>
        <p className="text-gray-600 mt-2">Discover our professional parlour services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const gradient = getGradient(service._id);
          const hasProducts = service.includedProducts?.length > 0;

          return (
            <Card
              key={service._id}
              className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow p-0"
            >
              {/* Banner */}
              <Link href={`/services/${service._id}`}>
                <div className={`bg-gradient-to-br ${gradient} h-40 flex flex-col items-center justify-center gap-2`}>
                  <div className="text-5xl opacity-50">✂️</div>
                  {hasProducts && (
                    <span className="text-xs font-semibold bg-white/60 text-gray-800 px-3 py-1 rounded-full">
                      {service.includedProducts.length} product{service.includedProducts.length !== 1 ? "s" : ""} included
                    </span>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-2">
                  <span
                    className="inline-block text-xs font-semibold px-2 py-1 rounded"
                    style={{ backgroundColor: "var(--shop-rose-soft)", color: "var(--shop-rose-strong)" }}
                  >
                    Service
                  </span>
                </div>

                <Link href={`/services/${service._id}`} className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>
                </Link>

                {/* Price */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-2xl font-bold" style={{ color: "var(--shop-rose-strong)" }}>
                      ₹{service.totalPrice.toFixed(2)}
                    </span>
                    {hasProducts && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Base ₹{service.basePrice.toFixed(2)} + products
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/services/${service._id}`}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    View details →
                  </Link>
                </div>

                <div className="mt-auto">
                  <AddToCartButton
                    itemId={service._id}
                    itemType="service"
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
