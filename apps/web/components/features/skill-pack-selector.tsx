"use client";

import * as React from "react";
import { Check, Sparkles, Zap, Briefcase, Home } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SKILL_PACKS = [
  {
    id: "marketing",
    name: "Marketing",
    description: "Automate your marketing workflow",
    icon: Sparkles,
    price: 47,
    features: [
      "Blog post generation",
      "Social media scheduling",
      "Email campaigns",
      "SEO optimization",
    ],
  },
  {
    id: "sales",
    name: "Sales",
    description: "Close more deals faster",
    icon: Zap,
    price: 47,
    features: [
      "Lead research & enrichment",
      "Cold outreach automation",
      "CRM sync",
      "Follow-up reminders",
    ],
  },
  {
    id: "personal",
    name: "Personal",
    description: "Your AI assistant for daily tasks",
    icon: Home,
    price: 27,
    features: [
      "Email triage",
      "Calendar management",
      "Task reminders",
      "Weather alerts",
    ],
  },
];

interface SkillPackSelectorProps {
  selected?: string[];
  onSelect?: (packId: string) => void;
}

export function SkillPackSelector({
  selected = [],
  onSelect,
}: SkillPackSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {SKILL_PACKS.map((pack) => {
        const isSelected = selected.includes(pack.id);
        const Icon = pack.icon;

        return (
          <Card
            key={pack.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              isSelected && "border-primary bg-primary/5"
            )}
            onClick={() => onSelect?.(pack.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-lg font-semibold">${pack.price}/mo</span>
              </div>
              <CardTitle className="text-xl">{pack.name}</CardTitle>
              <CardDescription>{pack.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {pack.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              {isSelected && (
                <div className="mt-4 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    Selected ✓
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
