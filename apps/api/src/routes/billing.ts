/**
 * Billing Routes - Stripe integration
 */

import { Router } from "express";
import Stripe from "stripe";
import { getUserById, updateUser } from "../lib/auth";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_...", {
  apiVersion: "2024-11-20.acacia",
});

const PRICES = {
  personal: { priceId: "price_personal", amount: 2700 }, // $27.00
  professional: { priceId: "price_professional", amount: 4700 }, // $47.00
  business: { priceId: "price_business", amount: 9700 }, // $97.00
};

/**
 * GET /billing/plans
 * Get available plans
 */
router.get("/plans", (req, res) => {
  res.json({
    plans: [
      {
        id: "free",
        name: "Free",
        price: 0,
        features: ["1 skill pack", "Limited usage"],
      },
      {
        id: "personal",
        name: "Personal",
        price: 27,
        priceId: PRICES.personal.priceId,
        features: ["Personal skill pack", "Unlimited usage", "Email support"],
      },
      {
        id: "professional",
        name: "Professional",
        price: 47,
        priceId: PRICES.professional.priceId,
        features: ["2 skill packs", "Unlimited usage", "Priority support"],
      },
      {
        id: "business",
        name: "Business",
        price: 97,
        priceId: PRICES.business.priceId,
        features: ["All skill packs", "Unlimited usage", "24/7 support", "Custom integrations"],
      },
    ],
  });
});

/**
 * POST /billing/create-checkout
 * Create Stripe checkout session
 */
router.post("/create-checkout", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { planId } = z.object({ planId: z.string() }).parse(req.body);
    
    if (!PRICES[planId as keyof typeof PRICES]) {
      res.status(400).json({ error: "Invalid plan" });
      return;
    }

    const user = getUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [
        {
          price: PRICES[planId as keyof typeof PRICES].priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        planId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Create checkout error:", error);
    res.status(500).json({ error: "Failed to create checkout" });
  }
});

/**
 * POST /billing/create-portal
 * Create Stripe billing portal session
 */
router.post("/create-portal", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const user = getUserById(req.user!.id);
    if (!user || !user.stripeCustomerId) {
      res.status(404).json({ error: "No subscription found" });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Create portal error:", error);
    res.status(500).json({ error: "Failed to create portal" });
  }
});

/**
 * GET /billing/subscription
 * Get current subscription status
 */
router.get("/subscription", authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const user = getUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!user.stripeCustomerId) {
      res.json({ subscription: null, tier: user.subscriptionTier });
      return;
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      res.json({ subscription: null, tier: "free" });
      return;
    }

    const sub = subscriptions.data[0];
    const tier = sub.metadata?.planId || "professional";

    res.json({
      subscription: {
        id: sub.id,
        status: sub.status,
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
      tier,
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ error: "Failed to get subscription" });
  }
});

/**
 * POST /billing/webhook
 * Handle Stripe webhooks
 */
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = req.body as Stripe.Event;
    }
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    res.status(400).json({ error: "Webhook error" });
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.userId) {
          updateUser(session.metadata.userId, {
            stripeCustomerId: session.customer as string,
            subscriptionTier: session.metadata.planId as any,
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        
        // Find user by stripe customer ID
        const users = await import("../lib/auth").then((m) => m.getAllUsers());
        const user = users.find((u) => u.stripeCustomerId === customerId);
        
        if (user) {
          updateUser(user.id, {
            subscriptionTier: sub.status === "active" 
              ? (sub.metadata?.planId as any) 
              : "free",
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({ error: "Webhook handler error" });
  }
});

export default router;
