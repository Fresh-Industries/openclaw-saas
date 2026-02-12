"use client";

import { useState, useEffect } from "react";
import { Loader2, CreditCard, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Subscription {
  tier: string;
  status?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export default function BillingSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/billing/subscription/demo-user");
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
      // Demo data
      setSubscription({
        tier: "professional",
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
      });
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/billing/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo-user" }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setPortalLoading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "business":
        return <Badge className="bg-purple-600">Business</Badge>;
      case "professional":
        return <Badge className="bg-blue-600">Professional</Badge>;
      case "personal":
        return <Badge variant="secondary">Personal</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing settings
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your current subscription details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-lg capitalize">
                    {subscription?.tier || "Free"}
                  </p>
                  {subscription?.status === "active" && (
                    <Badge variant="outline" className="text-green-600">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {subscription?.tier === "free"
                    ? "You're on the free plan"
                    : `${subscription?.status === "active" ? "Active" : ""} subscription`}
                </p>
              </div>
            </div>
            
            {subscription?.tier !== "free" && (
              <Button variant="outline" onClick={handleManageBilling} disabled={portalLoading}>
                {portalLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Manage Billing
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>

          {subscription?.tier !== "free" && subscription?.currentPeriodEnd && (
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-2">
                {subscription.cancelAtPeriodEnd ? (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                <span className="font-medium">
                  {subscription.cancelAtPeriodEnd
                    ? "Cancels at end of period"
                    : "Renews automatically"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Next billing date:{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {subscription?.tier === "free" && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
            <CardDescription>
              Unlock more features with a paid plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/pricing">View Plans</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Your payment method on file
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription?.tier !== "free" ? (
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="p-2 rounded bg-muted">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2025</p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={handleManageBilling}>
                Update
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No payment method on file. Upgrade to add one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Your past invoices and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscription?.tier !== "free" ? (
              [
                { date: "Feb 1, 2026", amount: "$47.00", status: "Paid" },
                { date: "Jan 1, 2026", amount: "$47.00", status: "Paid" },
                { date: "Dec 1, 2025", amount: "$47.00", status: "Paid" },
              ].map((invoice, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">{invoice.date}</p>
                    <p className="text-sm text-muted-foreground">Professional Plan</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{invoice.amount}</span>
                    <Badge variant="outline">{invoice.status}</Badge>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No billing history yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
