"use client";

import { useAuth } from "@/lib/auth-context";
import { useStoreSubscription } from "@/hooks/use-store";
import { getNotifications } from "@/lib/store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  LayoutDashboard,
  FileText,
  PenTool,
  Users,
  Shield,
  ScrollText,
  Bell,
  LogOut,
  GraduationCap,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface AppSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

interface NavItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function AppSidebar({ currentView, onNavigate }: AppSidebarProps) {
  const { user, logout } = useAuth();
  useStoreSubscription();

  if (!user) return null;

  const unreadCount = getNotifications(user.id).filter((n) => !n.read).length;

  const studentNav: NavItem[] = [
    { label: "Dashboard", value: "dashboard", icon: LayoutDashboard },
    { label: "Assessments", value: "assessments", icon: FileText },
    { label: "My Submissions", value: "submissions", icon: PenTool },
    {
      label: "Notifications",
      value: "notifications",
      icon: Bell,
      badge: unreadCount || undefined,
    },
  ];

  const teacherNav: NavItem[] = [
    { label: "Dashboard", value: "dashboard", icon: LayoutDashboard },
    { label: "Assessments", value: "assessments", icon: ClipboardCheck },
    { label: "Submissions", value: "submissions", icon: FileText },
    { label: "AI Metrics", value: "metrics", icon: BarChart3 },
    {
      label: "Notifications",
      value: "notifications",
      icon: Bell,
      badge: unreadCount || undefined,
    },
  ];

  const adminNav: NavItem[] = [
    { label: "Dashboard", value: "dashboard", icon: LayoutDashboard },
    { label: "User Management", value: "users", icon: Users },
    { label: "System Logs", value: "logs", icon: ScrollText },
    { label: "Assessments", value: "assessments", icon: FileText },
    {
      label: "Notifications",
      value: "notifications",
      icon: Bell,
      badge: unreadCount || undefined,
    },
  ];

  const navItems =
    user.role === "admin"
      ? adminNav
      : user.role === "teacher"
      ? teacherNav
      : studentNav;

  const roleLabel =
    user.role === "admin"
      ? "Administrator"
      : user.role === "teacher"
      ? "Teacher"
      : "Student";

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <BookOpen className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground leading-tight">
              GradeAI
            </span>
            <span className="text-[11px] text-sidebar-foreground/60 leading-tight">
              Evaluation Platform
            </span>
          </div>
        </div>
      </SidebarHeader>

      <Separator className="bg-sidebar-border" />

      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-widest font-semibold">
            {roleLabel} Panel
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    isActive={currentView === item.value}
                    onClick={() => onNavigate(item.value)}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.badge ? (
                    <SidebarMenuBadge className="bg-destructive text-destructive-foreground">
                      {item.badge}
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-widest font-semibold">
              Security
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={currentView === "security"}
                    onClick={() => onNavigate("security")}
                    tooltip="Security"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Access Control</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <Separator className="bg-sidebar-border" />

      <SidebarFooter className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-sidebar-foreground leading-tight">
              {user.name}
            </span>
            <span className="truncate text-[11px] text-sidebar-foreground/60 leading-tight">
              {user.email}
            </span>
          </div>
          <button
            onClick={logout}
            className="rounded-md p-1.5 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
