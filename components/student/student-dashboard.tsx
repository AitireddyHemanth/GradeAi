"use client";

import { useAuth } from "@/lib/auth-context";
import { useStoreSubscription } from "@/hooks/use-store";
import {
  getAssessments,
  getSubmissionsByStudent,
  getUserById,
} from "@/lib/store";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";

export function StudentDashboard() {
  const { user } = useAuth();
  useStoreSubscription();

  if (!user) return null;

  const assessments = getAssessments();
  const mySubmissions = getSubmissionsByStudent(user.id);

  const totalAssessments = assessments.length;
  const submittedIds = new Set(mySubmissions.map((s) => s.assessmentId));
  const pendingAssessments = assessments.filter(
    (a) => !submittedIds.has(a.id) && !isPast(new Date(a.dueDate))
  );
  const gradedSubmissions = mySubmissions.filter((s) => s.status === "graded");
  const pendingGrading = mySubmissions.filter((s) => s.status === "pending");

  const avgGrade =
    gradedSubmissions.length > 0
      ? Math.round(
          gradedSubmissions.reduce((acc, s) => acc + (s.grade ?? 0), 0) /
            gradedSubmissions.length
        )
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Student Dashboard"
        description={`Welcome back, ${user.name.split(" ")[0]}. Here is your academic progress overview.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Assessments"
          value={totalAssessments}
          icon={FileText}
          description="Assigned to you"
        />
        <StatCard
          label="Pending"
          value={pendingAssessments.length}
          icon={Clock}
          description="Awaiting submission"
        />
        <StatCard
          label="Graded"
          value={gradedSubmissions.length}
          icon={CheckCircle}
          description={`${pendingGrading.length} awaiting review`}
        />
        <StatCard
          label="Average Grade"
          value={gradedSubmissions.length > 0 ? `${avgGrade}%` : "N/A"}
          icon={TrendingUp}
          description={
            gradedSubmissions.length > 0
              ? `Across ${gradedSubmissions.length} graded`
              : "No grades yet"
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Assessments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              Upcoming Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingAssessments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No pending assessments
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingAssessments.map((assessment) => {
                  const teacher = getUserById(assessment.createdBy);
                  return (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-foreground">
                          {assessment.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {assessment.subject}
                          {teacher ? ` — ${teacher.name}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs">
                          {assessment.totalMarks} marks
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Due{" "}
                          {formatDistanceToNow(new Date(assessment.dueDate), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Graded Results */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Recent Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gradedSubmissions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No graded submissions yet
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {gradedSubmissions.slice(0, 5).map((sub) => {
                  const assessment = assessments.find(
                    (a) => a.id === sub.assessmentId
                  );
                  const percentage =
                    assessment && sub.grade !== null
                      ? Math.round(
                          (sub.grade / assessment.totalMarks) * 100
                        )
                      : 0;
                  return (
                    <div
                      key={sub.id}
                      className="flex flex-col gap-2 rounded-lg border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {assessment?.title ?? "Unknown Assessment"}
                        </p>
                        <span className="text-sm font-bold text-foreground">
                          {sub.grade}/{assessment?.totalMarks}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-1.5" />
                      {sub.feedback && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {sub.feedback}
                        </p>
                      )}
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
