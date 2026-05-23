"use client";

import { useState } from "react";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { LoginForm } from "@/components/auth/login-form";

// Student views
import { StudentDashboard } from "@/components/student/student-dashboard";
import { StudentAssessments } from "@/components/student/student-assessments";
import { StudentSubmissions } from "@/components/student/student-submissions";

// Teacher views
import { TeacherDashboard } from "@/components/teacher/teacher-dashboard";
import { TeacherAssessments } from "@/components/teacher/teacher-assessments";
import { TeacherSubmissions } from "@/components/teacher/teacher-submissions";
import { AIMetricsPanel } from "@/components/teacher/ai-metrics-panel";

// Admin views
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { UserManagement } from "@/components/admin/user-management";
import { SystemLogs } from "@/components/admin/system-logs";
import { SecurityPanel } from "@/components/admin/security-panel";

// Shared views
import { NotificationPanel } from "@/components/shared/notification-panel";

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState("dashboard");

  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  function renderView(): React.ReactNode {
    if (!user) return null;

    // Student views
    if (user.role === "student") {
      switch (currentView) {
        case "assessments":
          return <StudentAssessments />;
        case "submissions":
          return <StudentSubmissions />;
        case "notifications":
          return <NotificationPanel />;
        default:
          return <StudentDashboard />;
      }
    }

    // Teacher views
    if (user.role === "teacher") {
      switch (currentView) {
        case "assessments":
          return <TeacherAssessments />;
        case "submissions":
          return <TeacherSubmissions />;
        case "metrics":
          return <AIMetricsPanel />;
        case "notifications":
          return <NotificationPanel />;
        default:
          return <TeacherDashboard />;
      }
    }

    // Admin views
    if (user.role === "admin") {
      switch (currentView) {
        case "users":
          return <UserManagement />;
        case "logs":
          return <SystemLogs />;
        case "assessments":
          return <TeacherAssessments />;
        case "security":
          return <SecurityPanel />;
        case "notifications":
          return <NotificationPanel />;
        default:
          return <AdminDashboard />;
      }
    }

    return <StudentDashboard />;
  }

  return (
    <SidebarProvider>
      <AppSidebar currentView={currentView} onNavigate={setCurrentView} />
      <SidebarInset>
        <main className="flex-1 p-6">{renderView()}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
