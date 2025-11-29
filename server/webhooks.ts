import { Request, Response } from "express";
import { stripe } from "./stripe";
import { ENV } from "./_core/env";
import { createPurchase, updatePurchaseStatus, getPatternById } from "./db";

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Webhook] No signature found");
    return res.status(400).send("No signature");
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({
      verified: true,
    });
  }

  console.log("[Webhook] Received event:", event.type, event.id);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = parseInt(session.metadata.user_id);
        const patternId = parseInt(session.metadata.pattern_id);

        // Create purchase record
        await createPurchase({
          userId,
          patternId,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          amount: session.amount_total,
          status: "completed",
        });

        console.log("[Webhook] Purchase recorded:", {
          userId,
          patternId,
          sessionId: session.id,
        });
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as any;
        console.log("[Webhook] Payment succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as any;
        console.log("[Webhook] Payment failed:", paymentIntent.id);
        break;
      }

      default:
        console.log("[Webhook] Unhandled event type:", event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
}
