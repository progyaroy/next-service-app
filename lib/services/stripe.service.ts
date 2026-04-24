import "server-only";

import Stripe from "stripe";
import { AppError } from "@/lib/errors/AppError";

const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    // During build time, return a mock instance
    if (process.env.NODE_ENV === "production" && !process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    // Return a mock for build time
    return null;
  }

  return new Stripe(secretKey, {
    apiVersion: "2026-03-25.dahlia",
  });
};

const stripe = getStripeInstance();

export interface CreatePaymentIntentInput {
  userId: string;
  amount: number;
  email: string;
  orderId: string;
  description?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

class StripeService {
  private getStripe(): Stripe {
    if (!stripe) {
      throw new AppError("Stripe is not configured", 500, "STRIPE_NOT_CONFIGURED");
    }
    return stripe;
  }

  /**
   * Create or retrieve a Stripe customer for a user
   */
  async getOrCreateCustomer(email: string, userId: string): Promise<string> {
    try {
      const stripeInstance = this.getStripe();
      
      // Search for existing customer
      const customers = await stripeInstance.customers.list({
        email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        return customers.data[0].id;
      }

      // Create new customer
      const customer = await stripeInstance.customers.create({
        email,
        metadata: {
          userId,
        },
      });

      return customer.id;
    } catch (error) {
      console.error("[Stripe] Error managing customer:", error);
      throw new AppError("Failed to create customer", 500, "STRIPE_CUSTOMER_ERROR");
    }
  }

  /**
   * Create a payment intent for checkout
   */
  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResponse> {
    try {
      const stripeInstance = this.getStripe();
      const customerId = await this.getOrCreateCustomer(input.email, input.userId);

      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: Math.round(input.amount * 100), // Convert to cents
        currency: "usd",
        customer: customerId,
        description: input.description || `Order ${input.orderId}`,
        metadata: {
          userId: input.userId,
          orderId: input.orderId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret || "",
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error("[Stripe] Error creating payment intent:", error);
      throw new AppError(
        "Failed to create payment intent",
        500,
        "STRIPE_PAYMENT_INTENT_ERROR"
      );
    }
  }

  /**
   * Retrieve payment intent details
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const stripeInstance = this.getStripe();
      return await stripeInstance.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error("[Stripe] Error retrieving payment intent:", error);
      throw new AppError(
        "Failed to retrieve payment intent",
        500,
        "STRIPE_PAYMENT_INTENT_ERROR"
      );
    }
  }

  /**
   * Confirm payment intent (for server-side confirmation if needed)
   */
  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const stripeInstance = this.getStripe();
      return await stripeInstance.paymentIntents.confirm(paymentIntentId);
    } catch (error) {
      console.error("[Stripe] Error confirming payment intent:", error);
      throw new AppError(
        "Failed to confirm payment intent",
        500,
        "STRIPE_PAYMENT_INTENT_ERROR"
      );
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body: string, signature: string): Stripe.Event {
    try {
      const stripeInstance = this.getStripe();
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
      }

      return stripeInstance.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error("[Stripe] Webhook signature verification failed:", error);
      throw new AppError(
        "Invalid webhook signature",
        401,
        "STRIPE_WEBHOOK_ERROR"
      );
    }
  }

  /**
   * Handle payment intent succeeded event
   */
  async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<{ orderId: string; userId: string }> {
    const orderId = paymentIntent.metadata?.orderId;
    const userId = paymentIntent.metadata?.userId;

    if (!orderId || !userId) {
      throw new AppError(
        "Invalid payment intent metadata",
        400,
        "STRIPE_METADATA_ERROR"
      );
    }

    return { orderId, userId };
  }

  /**
   * Handle payment intent failed event
   */
  async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<{ orderId: string; userId: string }> {
    const orderId = paymentIntent.metadata?.orderId;
    const userId = paymentIntent.metadata?.userId;

    if (!orderId || !userId) {
      throw new AppError(
        "Invalid payment intent metadata",
        400,
        "STRIPE_METADATA_ERROR"
      );
    }

    return { orderId, userId };
  }
}

export default new StripeService();
