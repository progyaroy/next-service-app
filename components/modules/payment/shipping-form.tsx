"use client";

import { useState } from "react";
import { Button, FormField, FormAlert } from "@/components/ui";

interface ShippingFormProps {
  onSubmit: (data: ShippingAddress) => Promise<void>;
  isLoading?: boolean;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export default function ShippingForm({ onSubmit, isLoading = false }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingAddress>({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Valid email is required");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!formData.street.trim()) {
      setError("Street address is required");
      return false;
    }
    if (!formData.city.trim()) {
      setError("City is required");
      return false;
    }
    if (!formData.state.trim()) {
      setError("State is required");
      return false;
    }
    if (!formData.postalCode.trim()) {
      setError("Postal code is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error("[Shipping Form] Error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process shipping address"
      );
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || isLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold">Shipping Address</h2>

        <div className="space-y-4">
          {/* Full Name */}
          <FormField id="name" label="Full Name">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isDisabled}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </FormField>

          {/* Email */}
          <FormField id="email" label="Email Address">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isDisabled}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </FormField>

          {/* Phone */}
          <FormField id="phone" label="Phone Number">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isDisabled}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </FormField>

          {/* Street Address */}
          <FormField id="street" label="Street Address">
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              disabled={isDisabled}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </FormField>

          {/* City */}
          <FormField id="city" label="City">
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={isDisabled}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </FormField>

          {/* State */}
          <FormField id="state" label="State / Province">
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={isDisabled}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </FormField>

          {/* Postal Code */}
          <FormField id="postalCode" label="Postal Code">
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              disabled={isDisabled}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </FormField>

          {/* Country */}
          <FormField id="country" label="Country">
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              disabled={isDisabled}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="JP">Japan</option>
              <option value="IN">India</option>
            </select>
          </FormField>
        </div>
      </div>

      <FormAlert>{error}</FormAlert>

      <Button
        type="submit"
        disabled={isDisabled}
        className="w-full"
        variant="primary"
      >
        {isSubmitting ? "Processing..." : "Continue to Order"}
      </Button>
    </form>
  );
}
