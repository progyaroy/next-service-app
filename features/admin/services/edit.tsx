"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Card } from "@/components/ui/card";
import { updateService } from "@/lib/actions/admin";

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface EditServiceFormProps {
  id: string;
  initialData: any;
  products: Product[];
}

export default function EditServiceForm({ id, initialData, products }: EditServiceFormProps) {
  const [state, formAction, isPending] = useActionState(
    (prevState: any, formData: FormData) => updateService(id, prevState, formData),
    { error: "" }
  );

  const initialProductIds = initialData.includedProducts?.map((p: any) => p.productId._id || p.productId) || [];
  const [selectedProducts, setSelectedProducts] = useState<string[]>(initialProductIds);

  const handleProductToggle = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const calculateProductsTotal = () => {
    return selectedProducts.reduce((sum, productId) => {
      const product = products.find((p) => p._id === productId);
      return sum + (product?.price || 0);
    }, 0);
  };

  return (
    <Form action={formAction} className="max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-4">
          <FormField id="name" label="Service Name">
            <TextInput
              name="name"
              placeholder="e.g., Haircut, Facial"
              defaultValue={initialData.name}
              required
            />
          </FormField>

          <FormField id="description" label="Description">
            <TextArea
              name="description"
              placeholder="Service description"
              defaultValue={initialData.description}
              rows={4}
              required
            />
          </FormField>

          <FormField id="basePrice" label="Base Price (Service Charge)">
            <TextInput
              type="number"
              name="basePrice"
              placeholder="0.00"
              step="0.01"
              min="0"
              defaultValue={initialData.basePrice}
              required
            />
          </FormField>

          {state.error && <FormAlert>{state.error}</FormAlert>}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isPending} loading={isPending}>
              {isPending ? "Updating..." : "Update Service"}
            </Button>
            <Link href="/admin/services">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </div>

        {/* Products Selection Section */}
        <div>
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Included Products</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {products.length === 0 ? (
                <p className="text-sm text-gray-600">No products available</p>
              ) : (
                products.map((product) => (
                  <label key={product._id} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="includedProducts"
                      value={product._id}
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => handleProductToggle(product._id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600">₹{product.price.toFixed(2)}</p>
                    </div>
                  </label>
                ))
              )}
            </div>

            {selectedProducts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Selected: {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""}
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-2">
                  Products Total: ₹{calculateProductsTotal().toFixed(2)}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Form>
  );
}
