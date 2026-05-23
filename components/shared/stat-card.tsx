"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </span>
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend.positive ? "text-success" : "text-destructive"
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
