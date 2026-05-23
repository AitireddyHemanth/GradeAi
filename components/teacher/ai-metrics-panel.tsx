"use client";

import { useAuth } from "@/lib/auth-context";
import { useStoreSubscription } from "@/hooks/use-store";
import { getAssessments, getSubmissions, getUserById } from "@/lib/store";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, BookOpen, TrendingUp, AlertCircle } from "lucide-react";

export function AIMetricsPanel() {
  const { user } = useAuth();
  useStoreSubscription();

  if (!user) return null;

  const myAssessments = getAssessments().filter(
    (a) => a.createdBy === user.id
  );
  const myAssessmentIds = new Set(myAssessments.map((a) => a.id));
  const submissions = getSubmissions().filter((s) =>
    myAssessmentIds.has(s.assessmentId)
  );

  const withMetrics = submissions.filter((s) => s.aiMetrics !== null);

  if (withMetrics.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="AI Writing Metrics"
          description="Aggregated writing analysis across all student submissions."
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No submissions with AI metrics yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avgWordCount = Math.round(
    withMetrics.reduce((a, s) => a + (s.aiMetrics?.wordCount ?? 0), 0) /
      withMetrics.length
  );
  const avgReadability = Math.round(
    withMetrics.reduce((a, s) => a + (s.aiMetrics?.readabilityScore ?? 0), 0) /
      withMetrics.length
  );
  const avgConsistency = Math.round(
    withMetrics.reduce(
      (a, s) => a + (s.aiMetrics?.consistencyScore ?? 0),
      0
    ) / withMetrics.length
  );
  const avgRepetition = (
    withMetrics.reduce(
      (a, s) => a + (s.aiMetrics?.repetitionIndex ?? 0),
      0
    ) / withMetrics.length
  ).toFixed(2);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="AI Writing Metrics"
        description="Aggregated writing analysis across all student submissions. These are decision-support metrics only."
      />

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Avg Word Count
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {avgWordCount}
                </span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Avg Readability
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {avgReadability}/100
                </span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                <TrendingUp className="h-5 w-5 text-chart-2" />
              </div>
            </div>
            <Progress value={avgReadability} className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Avg Consistency
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {avgConsistency}/100
                </span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <BarChart3 className="h-5 w-5 text-success" />
              </div>
            </div>
            <Progress value={avgConsistency} className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Avg Repetition
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {(parseFloat(avgRepetition) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Submission Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Per-Submission Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {withMetrics.map((sub) => {
              const assessment = myAssessments.find(
                (a) => a.id === sub.assessmentId
              );
              const student = getUserById(sub.studentId);
              const m = sub.aiMetrics!;
              return (
                <div
                  key={sub.id}
                  className="flex flex-col gap-3 rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {student?.name ?? "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {assessment?.title ?? "Unknown"}
                      </span>
                    </div>
                    <Badge
                      variant={
                        sub.status === "graded" ? "default" : "secondary"
                      }
                      className={
                        sub.status === "graded"
                          ? "bg-success text-success-foreground"
                          : ""
                      }
                    >
                      {sub.status === "graded"
                        ? `${sub.grade}/${assessment?.totalMarks}`
                        : "Pending"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
                    <MetricCell label="Words" value={m.wordCount} />
                    <MetricCell label="Sentences" value={m.sentenceCount} />
                    <MetricCell
                      label="Avg Length"
                      value={`${m.avgSentenceLength}`}
                    />
                    <MetricCell
                      label="Repetition"
                      value={`${(m.repetitionIndex * 100).toFixed(0)}%`}
                    />
                    <MetricCell
                      label="Readability"
                      value={`${m.readabilityScore}`}
                    />
                    <MetricCell
                      label="Consistency"
                      value={`${m.consistencyScore}`}
                    />
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

function MetricCell({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
