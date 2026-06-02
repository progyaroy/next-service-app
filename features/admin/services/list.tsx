"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteService } from "@/lib/actions/admin";

interface ServicesListProps {
  services: any[];
}

export function ServicesList({ services }: ServicesListProps) {
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      await deleteService(id);
    }
  };

  if (services.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600">No services found</p>
        <Link href="/admin/services/new">
          <Button className="mt-4">Create First Service</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <Card key={service._id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
              <p className="text-gray-600 mt-1">{service.description}</p>
              <div className="mt-3 space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Base Price:</span> ₹{service.basePrice.toFixed(2)}
                </p>
                {service.includedProducts && service.includedProducts.length > 0 && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Included Products:</span> {service.includedProducts.length}
                  </p>
                )}
                <p className="text-sm font-semibold text-gray-900">
                  Total Price: ₹{service.totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <Link href={`/admin/services/${service._id}`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(service._id)}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
