"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { useStoreSubscription } from "@/hooks/use-store";
import {
  getAssessments,
  getSubmissions,
  createAssessment,
  deleteAssessment,
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
  DialogDescription,
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
import { Plus, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export function TeacherAssessments() {
  const { user } = useAuth();
  useStoreSubscription();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [dueDate, setDueDate] = useState("");

  if (!user) return null;

  const allAssessments = getAssessments();
  // If teacher, show only theirs; admins see all
  const assessments =
    user.role === "admin"
      ? allAssessments
      : allAssessments.filter((a) => a.createdBy === user.id);
  const allSubmissions = getSubmissions();

  function handleCreate(e: FormEvent) {
    e.preventDefault();

    if (!title.trim() || !subject.trim() || !description.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const marks = parseInt(totalMarks, 10);
    if (isNaN(marks) || marks <= 0) {
      toast.error("Total marks must be a positive number.");
      return;
    }

    if (!dueDate) {
      toast.error("Please set a due date.");
      return;
    }

    createAssessment({
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim(),
      totalMarks: marks,
      dueDate: new Date(dueDate).toISOString(),
      createdBy: user.id,
    });

    toast.success(`Assessment "${title.trim()}" created successfully.`);
    setIsDialogOpen(false);
    resetForm();
  }

  function resetForm() {
    setTitle("");
    setSubject("");
    setDescription("");
    setTotalMarks("");
    setDueDate("");
  }

  function handleDelete(assessmentId: string) {
    deleteAssessment(assessmentId, user.id);
    toast.success("Assessment deleted.");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Manage Assessments"
        description="Create, manage, and track all your assessments."
        actions={
          user.role === "teacher" ? (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Assessment
            </Button>
          ) : undefined
        }
      />

      {assessments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No assessments yet. Create your first one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Total Marks</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Submissions</TableHead>
                {user.role === "teacher" && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((a) => {
                const subCount = allSubmissions.filter(
                  (s) => s.assessmentId === a.id
                ).length;
                const pendingCount = allSubmissions.filter(
                  (s) =>
                    s.assessmentId === a.id && s.status === "pending"
                ).length;
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.subject}
                    </TableCell>
                    <TableCell>{a.totalMarks}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(a.dueDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{subCount}</span>
                        {pendingCount > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {pendingCount} pending
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    {user.role === "teacher" && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(a.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create Assessment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Assessment</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new assessment for your students.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="assess-title">Title</Label>
              <Input
                id="assess-title"
                placeholder="e.g., Essay on Climate Change"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="assess-subject">Subject</Label>
              <Input
                id="assess-subject"
                placeholder="e.g., Environmental Science"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="assess-desc">Description</Label>
              <Textarea
                id="assess-desc"
                placeholder="Describe the assignment requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="assess-marks">Total Marks</Label>
                <Input
                  id="assess-marks"
                  type="number"
                  min="1"
                  placeholder="100"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="assess-due">Due Date</Label>
                <Input
                  id="assess-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Create Assessment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
