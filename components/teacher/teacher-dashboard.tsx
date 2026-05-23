"use client";

import { useAuth } from "@/lib/auth-context";
import { useStoreSubscription } from "@/hooks/use-store";
import {
  getAssessments,
  getSubmissions,
  getUsers,
} from "@/lib/store";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck,
  FileText,
  Users,
  BarChart3,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

export function TeacherDashboard() {
  const { user } = useAuth();
  useStoreSubscription();

  if (!user) return null;

  const allAssessments = getAssessments();
  const myAssessments = allAssessments.filter(
    (a) => a.createdBy === user.id
  );
  const allSubmissions = getSubmissions();
  const mySubmissions = allSubmissions.filter((s) =>
    myAssessments.some((a) => a.id === s.assessmentId)
  );

  const pendingReview = mySubmissions.filter((s) => s.status === "pending");
  const graded = mySubmissions.filter((s) => s.status === "graded");
  const students = getUsers().filter((u) => u.role === "student");

  const avgConsistency =
    mySubmissions.length > 0
      ? Math.round(
          mySubmissions.reduce(
            (acc, s) => acc + (s.aiMetrics?.consistencyScore ?? 0),
            0
          ) / mySubmissions.length
        )
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Teacher Dashboard"
        description={`Welcome back, ${user.name.split(" ")[0]}. Manage your assessments and review student work.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="My Assessments"
          value={myAssessments.length}
          icon={ClipboardCheck}
          description={`${allAssessments.length} total in system`}
        />
        <StatCard
          label="Pending Review"
          value={pendingReview.length}
          icon={Clock}
          description="Submissions awaiting grading"
        />
        <StatCard
          label="Total Students"
          value={students.length}
          icon={Users}
          description="Enrolled in platform"
        />
        <StatCard
          label="Avg Consistency"
          value={`${avgConsistency}%`}
          icon={BarChart3}
          description="AI writing consistency score"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Assessments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Your Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myAssessments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No assessments created yet
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {myAssessments.map((a) => {
                  const subCount = allSubmissions.filter(
                    (s) => s.assessmentId === a.id
                  ).length;
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-foreground">
                          {a.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {a.subject} &middot; Due{" "}
                          {format(new Date(a.dueDate), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {subCount} submission{subCount !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Submissions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-warning" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingReview.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                All submissions reviewed
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingReview.slice(0, 5).map((sub) => {
                  const assessment = myAssessments.find(
                    (a) => a.id === sub.assessmentId
                  );
                  const student = getUsers().find(
                    (u) => u.id === sub.studentId
                  );
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-foreground">
                          {student?.name ?? "Unknown Student"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {assessment?.title ?? "Unknown"} &middot;{" "}
                          {format(
                            new Date(sub.submittedAt),
                            "MMM d 'at' h:mm a"
                          )}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Pending
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
