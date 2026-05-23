"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { useStoreSubscription } from "@/hooks/use-store";
import {
  getAssessments,
  getSubmissionsByStudent,
  createSubmission,
  getUserById,
} from "@/lib/store";
import { analyzeWriting } from "@/lib/ai-analysis";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileText, Clock, CheckCircle, Send, AlertTriangle } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { toast } from "sonner";

export function StudentAssessments() {
  const { user } = useAuth();
  useStoreSubscription();

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<
    string | null
  >(null);
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const assessments = getAssessments();
  const mySubmissions = getSubmissionsByStudent(user.id);
  const submittedMap = new Map(
    mySubmissions.map((s) => [s.assessmentId, s])
  );

  const selectedAssessment = assessments.find(
    (a) => a.id === selectedAssessmentId
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedAssessmentId || !user) return;

    const trimmed = submissionText.trim();
    if (trimmed.length < 10) {
      toast.error("Your submission must be at least 10 characters.");
      return;
    }

    setIsSubmitting(true);

    // Simulate a brief processing delay
    setTimeout(() => {
      const metrics = analyzeWriting(trimmed);
      createSubmission(selectedAssessmentId, user.id, trimmed, metrics);
      toast.success("Your submission has been sent for review.");
      setSelectedAssessmentId(null);
      setSubmissionText("");
      setIsSubmitting(false);
    }, 600);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Assessments"
        description="View all assigned assessments and submit your work."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assessments.map((assessment) => {
          const submission = submittedMap.get(assessment.id);
          const teacher = getUserById(assessment.createdBy);
          const overdue = isPast(new Date(assessment.dueDate));

          return (
            <Card key={assessment.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-snug">
                    {assessment.title}
                  </CardTitle>
                  {submission ? (
                    <Badge
                      variant={
                        submission.status === "graded"
                          ? "default"
                          : "secondary"
                      }
                      className={`shrink-0 text-[10px] ${
                        submission.status === "graded"
                          ? "bg-success text-success-foreground"
                          : ""
                      }`}
                    >
                      {submission.status === "graded" ? "Graded" : "Submitted"}
                    </Badge>
                  ) : overdue ? (
                    <Badge variant="destructive" className="shrink-0 text-[10px]">
                      Overdue
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      Open
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {assessment.subject}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {overdue
                      ? "Past due"
                      : `Due ${formatDistanceToNow(
                          new Date(assessment.dueDate),
                          { addSuffix: true }
                        )}`}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {assessment.description}
                </p>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    {teacher?.name ?? "Unknown"} &middot;{" "}
                    {assessment.totalMarks} marks
                  </span>

                  {submission ? (
                    submission.status === "graded" ? (
                      <span className="text-xs font-semibold text-foreground">
                        {submission.grade}/{assessment.totalMarks}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3" />
                        Awaiting grade
                      </span>
                    )
                  ) : !overdue ? (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => setSelectedAssessmentId(assessment.id)}
                    >
                      <Send className="mr-1 h-3 w-3" />
                      Submit
                    </Button>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-destructive">
                      <AlertTriangle className="h-3 w-3" />
                      Deadline passed
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Submission Dialog */}
      <Dialog
        open={selectedAssessmentId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAssessmentId(null);
            setSubmissionText("");
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAssessment?.title}</DialogTitle>
            <DialogDescription>
              {selectedAssessment?.description}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="submission-text">Your Response</Label>
              <Textarea
                id="submission-text"
                placeholder="Write your submission here..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                className="min-h-[200px]"
                required
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {submissionText.trim().split(/\s+/).filter(Boolean).length}{" "}
                  words
                </span>
                <span>
                  Total marks: {selectedAssessment?.totalMarks}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedAssessmentId(null);
                  setSubmissionText("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Analyzing & Submitting..." : "Submit Assignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
