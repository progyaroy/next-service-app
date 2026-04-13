"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/ui/form-field";
import { TextInput } from "@/components/ui/input";
import { TextArea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { createProduct } from "@/lib/actions/admin";

interface Category {
  _id: string;
  name: string;
}

interface NewProductProps {
  categories: Category[];
}

export default function NewProduct({ categories }: NewProductProps) {
  const [state, formAction, isPending] = useActionState(createProduct, {
    error: "",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
        <p className="text-gray-600 mt-1">Create a new product</p>
      </div>

      <Form action={formAction} className="max-w-2xl">
        <FormField id="name" label="Product Name">
          <TextInput
            name="name"
            placeholder="Product name"
            required
          />
        </FormField>

        <FormField id="description" label="Description">
          <TextArea
            name="description"
            placeholder="Product description"
            rows={4}
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField id="price" label="Price">
            <TextInput
              type="number"
              name="price"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </FormField>

          <FormField id="stock" label="Stock">
            <TextInput
              type="number"
              name="stock"
              placeholder="0"
              min="0"
              required
            />
          </FormField>
        </div>

        <FormField id="category" label="Category">
          <Select name="category" required>
            <option value="">Select a category</option>
            {categories.map((cat: any) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </FormField>

        {state.error && <FormAlert>{state.error}</FormAlert>}

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isPending} loading={isPending}>
            {isPending ? "Creating..." : "Create Product"}
          </Button>
          <Link href="/admin/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </Form>
    </div>
  );
}
