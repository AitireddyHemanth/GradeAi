"use client";

import { useAuth } from "@/lib/auth-context";
import { useStoreSubscription } from "@/hooks/use-store";
import { getSubmissionsByStudent, getAssessmentById } from "@/lib/store";
import { getStudentFeedback } from "@/lib/ai-analysis";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, FileText, MessageSquare, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import type { Submission } from "@/lib/types";

export function StudentSubmissions() {
  const { user } = useAuth();
  useStoreSubscription();

  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  if (!user) return null;

  const submissions = getSubmissionsByStudent(user.id).sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  const selected = selectedSubmission;
  const selectedAssessment = selected
    ? getAssessmentById(selected.assessmentId)
    : null;
  const selectedFeedback =
    selected?.aiMetrics ? getStudentFeedback(selected.aiMetrics) : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Submissions"
        description="Track the status and feedback of all your submissions."
      />

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              You have not submitted any assignments yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => {
                const assessment = getAssessmentById(sub.assessmentId);
                const percentage =
                  assessment && sub.grade !== null
                    ? Math.round(
                        (sub.grade / assessment.totalMarks) * 100
                      )
                    : null;
                return (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      {assessment?.title ?? "Unknown"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {assessment?.subject ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(sub.submittedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
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
                        {sub.status === "graded" ? "Graded" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub.grade !== null ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {sub.grade}/{assessment?.totalMarks}
                          </span>
                          {percentage !== null && (
                            <span className="text-xs text-muted-foreground">
                              ({percentage}%)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Submission Detail Dialog */}
      <Dialog
        open={selectedSubmission !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSubmission(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAssessment?.title ?? "Submission Details"}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="flex flex-col gap-5">
              {/* Grade Section */}
              {selected.status === "graded" && selectedAssessment && (
                <Card className="border-success/30 bg-success/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        Your Grade
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {selected.grade}/{selectedAssessment.totalMarks}
                      </span>
                    </div>
                    <Progress
                      value={
                        selected.grade !== null
                          ? (selected.grade / selectedAssessment.totalMarks) *
                            100
                          : 0
                      }
                      className="h-2"
                    />
                    {selected.feedback && (
                      <div className="mt-3 flex items-start gap-2">
                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selected.feedback}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* AI Feedback (simplified) */}
              {selectedFeedback.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Writing Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="flex flex-col gap-2">
                      {selectedFeedback.map((fb, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {fb}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Submission Text */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">
                    Your Submission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selected.submissionText}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
