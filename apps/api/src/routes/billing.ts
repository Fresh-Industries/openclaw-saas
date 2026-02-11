/**
 * Billing Routes - Stripe integration
 */

import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { prisma } from "../lib/db";

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_...", {
  apiVersion: "2024-11-20.acacia",
});

const PLANS = {
  free: { priceId: null, price: 0, name: "Free" },
  personal: { priceId: "price_personal", price: 2700, name: "Personal" },
  professional: { priceId: "price_professional", price: 4700, name: "Professional" },
  business: { priceId: "price_business", price: 9700, name: "Business" },
};

/**
 * GET /api/billing/plans
 * Get available plans
 */
router.get("/plans", (_req: Request, res: Response) => {
  res.json({
    plans: Object.entries(PLANS).map(([id, plan]) => ({
      id,
      name: plan.name,
      price: plan.price / 100,
      priceId: plan.priceId,
    })),
  });
});

/**
 * POST /api/billing/create-checkout
 * Create Stripe checkout session
 */
router.post("/create-checkout", async (req: Request, res: Response) => {
  try {
    const { userId, planId } = req.body;
    
    if (!PLANS[planId as keyof typeof PLANS]) {
      res.status(400).json({ error: "Invalid plan" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [
        {
          price: PLANS[planId as keyof typeof PLANS].priceId!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
      metadata: {
        userId,
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
 * POST /api/billing/create-portal
 * Create Stripe billing portal session
 */
router.post("/create-portal", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.stripeCustomerId) {
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
 * GET /api/billing/subscription/:userId
 * Get user's subscription status
 */
router.get("/subscription/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    res.json({
      tier: user.subscriptionTier,
      subscription,
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ error: "Failed to get subscription" });
  }
});

/**
 * POST /api/billing/webhook
 * Handle Stripe webhooks
 */
router.post("/webhook", async (req: Request, res: Response) => {
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
    console.error("Webhook verification failed:", error);
    res.status(400).json({ error: "Webhook error" });
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.userId && session.metadata?.planId) {
          await prisma.user.update({
            where: { id: session.metadata.userId },
            data: {
              stripeCustomerId: session.customer as string,
              subscriptionTier: session.metadata.planId,
            },
          });
          
          await prisma.subscription.upsert({
            where: { userId: session.metadata.userId },
            create: {
              userId: session.metadata.userId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              tier: session.metadata.planId,
              status: "active",
            },
            update: {
              stripeSubscriptionId: session.subscription as string,
              tier: session.metadata.planId,
              status: "active",
            },
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });
        
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionTier: sub.status === "active" 
                ? "professional" 
                : "free",
            },
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
