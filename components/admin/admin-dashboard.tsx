"use client";

import { useAuth } from "@/lib/auth-context";
import { useStoreSubscription } from "@/hooks/use-store";
import {
  getUsers,
  getAssessments,
  getSubmissions,
  getSystemLogs,
} from "@/lib/store";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, ClipboardCheck, ScrollText } from "lucide-react";
import { format } from "date-fns";

const ACTION_COLORS: Record<string, string> = {
  USER_LOGIN: "bg-chart-1/10 text-chart-1",
  USER_REGISTERED: "bg-success/10 text-success",
  ASSESSMENT_CREATED: "bg-primary/10 text-primary",
  ASSESSMENT_DELETED: "bg-destructive/10 text-destructive",
  SUBMISSION_CREATED: "bg-chart-2/10 text-chart-2",
  SUBMISSION_GRADED: "bg-success/10 text-success",
  ROLE_CHANGED: "bg-warning/10 text-warning",
  USER_DELETED: "bg-destructive/10 text-destructive",
};

export function AdminDashboard() {
  const { user } = useAuth();
  useStoreSubscription();

  if (!user) return null;

  const users = getUsers();
  const assessments = getAssessments();
  const submissions = getSubmissions();
  const logs = getSystemLogs().slice(0, 8);

  const studentCount = users.filter((u) => u.role === "student").length;
  const teacherCount = users.filter((u) => u.role === "teacher").length;
  const pendingSubmissions = submissions.filter(
    (s) => s.status === "pending"
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Admin Dashboard"
        description="System overview and management controls."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={users.length}
          icon={Users}
          description={`${studentCount} students, ${teacherCount} teachers`}
        />
        <StatCard
          label="Assessments"
          value={assessments.length}
          icon={ClipboardCheck}
          description="Total in system"
        />
        <StatCard
          label="Submissions"
          value={submissions.length}
          icon={FileText}
          description={`${pendingSubmissions} pending review`}
        />
        <StatCard
          label="System Logs"
          value={getSystemLogs().length}
          icon={ScrollText}
          description="Total logged events"
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-primary" />
            Recent System Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {logs.map((log) => {
              const performer = users.find((u) => u.id === log.performedBy);
              const colorClass =
                ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground";
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-[10px] font-mono ${colorClass} border-transparent`}
                  >
                    {log.action}
                  </Badge>
                  <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                    <p className="text-sm text-foreground truncate">
                      {log.details}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {performer?.name ?? log.performedBy} &middot;{" "}
                      {format(
                        new Date(log.timestamp),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
