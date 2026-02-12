"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ArrowLeft, Loader2, Zap, Sparkles, Briefcase, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PLANS = [
  {
    id: "personal",
    name: "Personal",
    description: "For individuals who want their own AI assistant",
    price: 27,
    icon: Zap,
    features: [
      "1 AI agent container",
      "Personal skill pack",
      "Unlimited messages",
      "Basic support",
      "Email notifications",
    ],
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    description: "For freelancers and small teams",
    price: 47,
    icon: Briefcase,
    features: [
      "2 AI agent containers",
      "Marketing & Sales skill packs",
      "Unlimited messages",
      "Priority support",
      "API access",
      "Custom integrations",
    ],
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    description: "For companies with multiple users",
    price: 97,
    icon: Building2,
    features: [
      "5 AI agent containers",
      "All skill packs",
      "Unlimited messages",
      "24/7 dedicated support",
      "Full API access",
      "Custom integrations",
      "Team management",
      "SSO / SAML",
      "Custom branding",
    ],
    popular: false,
  },
];

const COMPARISON = [
  { feature: "AI Agent Containers", personal: "1", professional: "2", business: "5" },
  { feature: "Skill Packs", personal: "1", professional: "2", business: "All" },
  { feature: "Messages", personal: "Unlimited", professional: "Unlimited", business: "Unlimited" },
  { feature: "API Access", personal: false, professional: true, business: true },
  { feature: "Priority Support", personal: false, professional: true, business: true },
  { feature: "Dedicated Support", personal: false, professional: false, business: true },
  { feature: "Team Members", personal: "1", professional: "3", business: "Unlimited" },
  { feature: "SSO / SAML", personal: false, professional: false, business: true },
  { feature: "Custom Branding", personal: false, professional: false, business: true },
];

export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const handleSelectPlan = async (planId: string) => {
    if (planId === "personal") {
      router.push("/dashboard");
      return;
    }

    setIsLoading(planId);
    try {
      const response = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user", // Would get from session
          planId,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Choose the plan that fits your needs. All plans include our core AI agent capabilities.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={billingCycle === "monthly" ? "font-medium" : "text-muted-foreground"}>
              Monthly
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
            >
              {billingCycle === "monthly" ? "Switch to Annual" : "Switch to Monthly"}
            </Button>
            <span className={billingCycle === "annual" ? "font-medium" : "text-muted-foreground"}>
              Annual
            </span>
            {billingCycle === "annual" && (
              <Badge variant="secondary" className="text-green-600">
                Save 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto mb-16">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const annualPrice = Math.round(plan.price * 12 * 0.8);
            
            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        ${billingCycle === "monthly" ? plan.price : annualPrice}
                      </span>
                      <span className="text-muted-foreground">
                        /{billingCycle === "monthly" ? "mo" : "yr"}
                      </span>
                    </div>
                    {billingCycle === "annual" && (
                      <p className="text-sm text-muted-foreground">
                        ${plan.price}/mo billed annually
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isLoading === plan.id}
                  >
                    {isLoading === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : plan.id === "personal" ? (
                      "Get Started Free"
                    ) : (
                      `Choose ${plan.name}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Compare Features
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 font-medium">Personal</th>
                  <th className="text-center py-4 px-4 font-medium">Professional</th>
                  <th className="text-center py-4 px-4 font-medium">Business</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-3 px-4">{row.feature}</td>
                    <td className="text-center py-3 px-4">
                      {typeof row.personal === "boolean" ? (
                        row.personal ? (
                          <Check className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : (
                        row.personal
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {typeof row.professional === "boolean" ? (
                        row.professional ? (
                          <Check className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : (
                        row.professional
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {typeof row.business === "boolean" ? (
                        row.business ? (
                          <Check className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : (
                        row.business
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Can I change plans later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards through Stripe. Enterprise customers can pay via invoice.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What's included in skill packs?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Each skill pack includes pre-configured AI agents with specific tools and workflows for different tasks.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Still have questions?
          </p>
          <Link href="mailto:support@openclaw.com">
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
