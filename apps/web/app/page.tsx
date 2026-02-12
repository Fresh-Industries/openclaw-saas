import Link from "next/link";
import { ArrowRight, Bot, Shield, Zap, Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Bot className="h-6 w-6" />
            <span>OpenClaw SaaS</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Login
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center py-24 md:py-32">
        <div className="container px-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Deploy AI Agents in{" "}
            <span className="text-primary">Minutes</span>, Not Months
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-[800px] mx-auto">
            Choose a skill pack, connect your accounts, and let your AI agent work for you.
            Marketing, Sales, Personal tasks—automated.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                See Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-muted/50">
        <div className="container px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Automate
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <Zap className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Marketing Pack</h3>
                <p className="text-muted-foreground">
                  Blog posts, social media, email campaigns—automated with AI.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Briefcase className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Sales Pack</h3>
                <p className="text-muted-foreground">
                  Lead research, outreach, follow-ups—never miss a lead again.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Shield className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Secure by Default</h3>
                <p className="text-muted-foreground">
                  Your data stays yours. Isolated containers per user.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="container px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Simple, Transparent Pricing
          </h2>
          <div className="grid gap-6 md:grid-cols-4 max-w-[1000px] mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Free</h3>
                <p className="text-3xl font-bold mb-4">$0</p>
                <p className="text-sm text-muted-foreground mb-6">
                  1 skill, limited usage
                </p>
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </CardContent>
            </Card>
            <Card className="border-primary">
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Personal</h3>
                <p className="text-3xl font-bold mb-4">$27/mo</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Personal pack included
                </p>
                <Button className="w-full">Get Started</Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Professional</h3>
                <p className="text-3xl font-bold mb-4">$47/mo</p>
                <p className="text-sm text-muted-foreground mb-6">
                  2 skill packs included
                </p>
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Business</h3>
                <p className="text-3xl font-bold mb-4">$97/mo</p>
                <p className="text-sm text-muted-foreground mb-6">
                  All packs, priority support
                </p>
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 OpenClaw SaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
