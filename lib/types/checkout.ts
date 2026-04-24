/**
 * Checkout and Payment related types
 */

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

export interface CheckoutRequest {
  shippingAddress: ShippingAddress;
}

export interface CheckoutResponse {
  orderId: string;
  clientSecret: string;
  paymentIntentId: string;
  totalAmount: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  stripePaymentIntentId: string;
  shippingAddress?: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}
