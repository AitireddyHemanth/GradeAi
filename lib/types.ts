// -------------------------------------------------------
// Domain Types — Assignment Evaluation & Writing Analysis
// -------------------------------------------------------

export type UserRole = "student" | "teacher" | "admin";

export interface User {
  readonly id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assessment {
  readonly id: string;
  title: string;
  subject: string;
  description: string;
  totalMarks: number;
  dueDate: string;
  createdBy: string; // teacher user id
  createdAt: string;
  updatedAt: string;
}

export type SubmissionStatus = "pending" | "graded";

export interface AIMetrics {
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  repetitionIndex: number;
  readabilityScore: number;
  consistencyScore: number;
}

export interface Submission {
  readonly id: string;
  assessmentId: string;
  studentId: string;
  submissionText: string;
  aiMetrics: AIMetrics | null;
  grade: number | null;
  feedback: string | null;
  status: SubmissionStatus;
  submittedAt: string;
  gradedAt: string | null;
}

export interface Notification {
  readonly id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface SystemLog {
  readonly id: string;
  action: string;
  performedBy: string;
  targetUser?: string;
  details: string;
  timestamp: string;
}

// -------------------------------------------------------
// Auth Types
// -------------------------------------------------------

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
