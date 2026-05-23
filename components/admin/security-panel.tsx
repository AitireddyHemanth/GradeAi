"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Key, FileCheck, Server, Eye } from "lucide-react";

const SECURITY_FEATURES = [
  {
    title: "Password Hashing",
    description:
      "All passwords are hashed using bcrypt with a cost factor of 12 before storage. Plain-text passwords are never persisted.",
    icon: Lock,
    status: "Active",
  },
  {
    title: "JWT Authentication",
    description:
      "Access tokens are signed with RS256 and expire after 24 hours. Refresh tokens rotate automatically.",
    icon: Key,
    status: "Active",
  },
  {
    title: "Role-Based Access Control",
    description:
      "Three-tier RBAC system (student, teacher, admin) with middleware-enforced route protection.",
    icon: Shield,
    status: "Active",
  },
  {
    title: "Input Validation",
    description:
      "All user inputs are validated and sanitized using Zod schemas before processing.",
    icon: FileCheck,
    status: "Active",
  },
  {
    title: "Secure Headers",
    description:
      "HTTP security headers including CSP, HSTS, X-Frame-Options, and X-Content-Type-Options.",
    icon: Server,
    status: "Active",
  },
  {
    title: "Audit Logging",
    description:
      "All critical actions are logged with timestamps, actor identity, and affected resources.",
    icon: Eye,
    status: "Active",
  },
];

export function SecurityPanel() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Access Control & Security"
        description="Overview of security measures and access control policies in the system."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SECURITY_FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <feature.icon className="h-4 w-4 text-primary" />
                  {feature.title}
                </CardTitle>
                <Badge
                  variant="outline"
                  className="bg-success/10 text-success border-success/20 text-[10px]"
                >
                  {feature.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
