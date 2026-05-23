"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { useStoreSubscription } from "@/hooks/use-store";
import {
  getAssessments,
  getSubmissions,
  getUserById,
  gradeSubmission,
} from "@/lib/store";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, CheckCircle, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Submission } from "@/lib/types";

export function TeacherSubmissions() {
  const { user } = useAuth();
  useStoreSubscription();

  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [gradeValue, setGradeValue] = useState("");
  const [feedbackValue, setFeedbackValue] = useState("");
  const [showMetrics, setShowMetrics] = useState(false);

  if (!user) return null;

  const myAssessments = getAssessments().filter(
    (a) => a.createdBy === user.id
  );
  const myAssessmentIds = new Set(myAssessments.map((a) => a.id));
  const submissions = getSubmissions()
    .filter((s) => myAssessmentIds.has(s.assessmentId))
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

  const selected = selectedSubmission;
  const selectedAssessment = selected
    ? myAssessments.find((a) => a.id === selected.assessmentId)
    : null;
  const selectedStudent = selected
    ? getUserById(selected.studentId)
    : null;

  function handleGrade(e: FormEvent) {
    e.preventDefault();
    if (!selected || !selectedAssessment || !user) return;

    const grade = parseInt(gradeValue, 10);
    if (isNaN(grade) || grade < 0 || grade > selectedAssessment.totalMarks) {
      toast.error(
        `Grade must be between 0 and ${selectedAssessment.totalMarks}.`
      );
      return;
    }

    if (!feedbackValue.trim()) {
      toast.error("Please provide feedback for the student.");
      return;
    }

    gradeSubmission(selected.id, grade, feedbackValue.trim(), user.id);
    toast.success("Submission graded successfully.");
    setSelectedSubmission(null);
    setGradeValue("");
    setFeedbackValue("");
    setShowMetrics(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Student Submissions"
        description="Review submissions, view AI analysis, and assign grades."
      />

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No submissions received yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Assessment</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Consistency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => {
                const assessment = myAssessments.find(
                  (a) => a.id === sub.assessmentId
                );
                const student = getUserById(sub.studentId);
                return (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      {student?.name ?? "Unknown"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {assessment?.title ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(sub.submittedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {sub.aiMetrics ? (
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              sub.aiMetrics.consistencyScore >= 70
                                ? "bg-success"
                                : sub.aiMetrics.consistencyScore >= 40
                                ? "bg-warning"
                                : "bg-destructive"
                            }`}
                          />
                          <span className="text-sm">
                            {sub.aiMetrics.consistencyScore}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
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
                        {sub.status === "graded"
                          ? `${sub.grade}/${assessment?.totalMarks ?? "?"}`
                          : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(sub);
                          if (sub.status === "graded") {
                            setGradeValue(String(sub.grade ?? ""));
                            setFeedbackValue(sub.feedback ?? "");
                          } else {
                            setGradeValue("");
                            setFeedbackValue("");
                          }
                        }}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        {sub.status === "pending" ? "Grade" : "View"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Grade/View Dialog */}
      <Dialog
        open={selectedSubmission !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSubmission(null);
            setShowMetrics(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.name} — {selectedAssessment?.title}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="flex flex-col gap-4">
              {/* Submission text */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">
                    Submission Text
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                    {selected.submissionText}
                  </p>
                </CardContent>
              </Card>

              {/* AI Metrics Toggle */}
              {selected.aiMetrics && (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMetrics(!showMetrics)}
                    className="w-fit"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {showMetrics ? "Hide" : "Show"} AI Metrics
                  </Button>

                  {showMetrics && (
                    <Card className="border-primary/20 bg-primary/[0.02]">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                          <MetricItem
                            label="Word Count"
                            value={selected.aiMetrics.wordCount}
                          />
                          <MetricItem
                            label="Sentences"
                            value={selected.aiMetrics.sentenceCount}
                          />
                          <MetricItem
                            label="Avg Sentence Length"
                            value={`${selected.aiMetrics.avgSentenceLength} words`}
                          />
                          <MetricItem
                            label="Repetition Index"
                            value={`${(selected.aiMetrics.repetitionIndex * 100).toFixed(0)}%`}
                          />
                          <MetricItem
                            label="Readability"
                            value={`${selected.aiMetrics.readabilityScore}/100`}
                          />
                          <MetricItem
                            label="Consistency"
                            value={`${selected.aiMetrics.consistencyScore}/100`}
                          />
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground italic">
                          AI metrics are for decision-support only and do not
                          determine grades.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Grade Form */}
              {selected.status === "pending" ? (
                <form onSubmit={handleGrade} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="grade-input">
                        Grade (out of {selectedAssessment?.totalMarks})
                      </Label>
                      <Input
                        id="grade-input"
                        type="number"
                        min="0"
                        max={selectedAssessment?.totalMarks}
                        placeholder="0"
                        value={gradeValue}
                        onChange={(e) => setGradeValue(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="feedback-input">Feedback</Label>
                    <Textarea
                      id="feedback-input"
                      placeholder="Provide constructive feedback..."
                      value={feedbackValue}
                      onChange={(e) => setFeedbackValue(e.target.value)}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedSubmission(null)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Submit Grade</Button>
                  </DialogFooter>
                </form>
              ) : (
                <Card className="border-success/30 bg-success/5">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Grade Assigned
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {selected.grade}/{selectedAssessment?.totalMarks}
                      </span>
                    </div>
                    {selected.feedback && (
                      <p className="text-sm text-muted-foreground">
                        {selected.feedback}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricItem({
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
