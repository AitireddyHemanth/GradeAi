"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {(description || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
    </div>
  );
}
