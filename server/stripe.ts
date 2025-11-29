import Stripe from "stripe";
import { ENV } from "./_core/env";

if (!ENV.stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-11-17.clover",
});

export async function createCheckoutSession({
  patternId,
  patternTitle,
  price,
  userId,
  userEmail,
  userName,
  origin,
}: {
  patternId: number;
  patternTitle: string;
  price: number; // in cents
  userId: number;
  userEmail: string;
  userName: string;
  origin: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: patternTitle,
            description: "Digital PDF Quilt Pattern",
          },
          unit_amount: price,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/patterns`,
    customer_email: userEmail,
    client_reference_id: userId.toString(),
    metadata: {
      user_id: userId.toString(),
      pattern_id: patternId.toString(),
      customer_email: userEmail,
      customer_name: userName,
    },
    allow_promotion_codes: true,
  });

  return session;
}
