/**
 * In-memory data store for the academic SaaS platform.
 * Acts as a simulated backend — all CRUD operations happen here.
 * In production, replace with real API calls.
 */

import type {
  User,
  Assessment,
  Submission,
  Notification,
  SystemLog,
  UserRole,
  AIMetrics,
} from "@/lib/types";

// -------------------------------------------------------
// ID generation
// -------------------------------------------------------
let _counter = Date.now();
function generateId(prefix: string): string {
  _counter += 1;
  return `${prefix}_${_counter.toString(36)}`;
}

// -------------------------------------------------------
// Seed Data
// -------------------------------------------------------

const SEED_USERS: User[] = [
  {
    id: "user_admin_1",
    name: "admin",
    email: "admin@gradeai.com",
    role: "admin",
    createdAt: "2025-09-01T08:00:00Z",
    updatedAt: "2025-09-01T08:00:00Z",
  },
  {
    id: "user_teacher_1",
    name: "Prof. Sravani",
    email: "sravani@gradeai.com",
    role: "teacher",
    createdAt: "2025-09-02T09:00:00Z",
    updatedAt: "2025-09-02T09:00:00Z",
  },
  {
    id: "user_teacher_2",
    name: "Dr. Katta kiran",
    email: "kiran@gradeai.com",
    role: "teacher",
    createdAt: "2025-09-03T10:00:00Z",
    updatedAt: "2025-09-03T10:00:00Z",
  },
  {
    id: "user_student_1",
    name: "Abhinay Nagireddi",
    email: "abhinay@student.gradeai.com",
    role: "student",
    createdAt: "2025-09-05T11:00:00Z",
    updatedAt: "2025-09-05T11:00:00Z",
  },
  {
    id: "user_student_2",
    name: "Shaik Afroz",
    email: "afroz@student.gradeai.com",
    role: "student",
    createdAt: "2025-09-06T12:00:00Z",
    updatedAt: "2025-09-06T12:00:00Z",
  },
  {
    id: "user_student_3",
    name: "Shaik Rihan",
    email: "rihan@student.gradeai.com",
    role: "student",
    createdAt: "2025-09-07T13:00:00Z",
    updatedAt: "2025-09-07T13:00:00Z",
  },
];

const SEED_ASSESSMENTS: Assessment[] = [
  {
    id: "assess_1",
    title: "Essay on Climate Change Impacts",
    subject: "Environmental Science",
    description:
      "Write a 500-word essay discussing the primary impacts of climate change on global ecosystems. Include at least three scientific references.",
    totalMarks: 100,
    dueDate: "2026-03-15T23:59:00Z",
    createdBy: "user_teacher_1",
    createdAt: "2025-10-01T09:00:00Z",
    updatedAt: "2025-10-01T09:00:00Z",
  },
  {
    id: "assess_2",
    title: "Analysis of Shakespeare's Hamlet",
    subject: "English Literature",
    description:
      "Provide a critical analysis of the theme of indecision in Hamlet. Your analysis should be 400-600 words.",
    totalMarks: 80,
    dueDate: "2026-03-20T23:59:00Z",
    createdBy: "user_teacher_2",
    createdAt: "2025-10-05T10:00:00Z",
    updatedAt: "2025-10-05T10:00:00Z",
  },
  {
    id: "assess_3",
    title: "Data Structures Problem Set",
    subject: "Computer Science",
    description:
      "Solve and explain the following problems on binary trees, hash maps, and graph traversal. Show your work for each.",
    totalMarks: 50,
    dueDate: "2026-04-01T23:59:00Z",
    createdBy: "user_teacher_1",
    createdAt: "2025-10-10T11:00:00Z",
    updatedAt: "2025-10-10T11:00:00Z",
  },
];

const SEED_SUBMISSIONS: Submission[] = [
  {
    id: "sub_1",
    assessmentId: "assess_1",
    studentId: "user_student_1",
    submissionText:
      "Climate change represents one of the most significant challenges facing our planet today. Rising global temperatures are causing widespread disruption to ecosystems around the world. The melting of polar ice caps has accelerated dramatically over the past decade, contributing to rising sea levels that threaten coastal communities. Marine ecosystems are particularly vulnerable, as ocean acidification disrupts the delicate balance of coral reef environments. On land, changing precipitation patterns are altering agricultural productivity and threatening food security for millions. Forests are experiencing increased frequency of wildfires, further contributing to carbon emissions in a dangerous feedback loop. Biodiversity loss continues at an alarming rate as species struggle to adapt to rapidly changing conditions. Scientific consensus indicates that without immediate and coordinated global action, these impacts will intensify significantly in the coming decades.",
    aiMetrics: {
      wordCount: 127,
      sentenceCount: 8,
      avgSentenceLength: 15.9,
      repetitionIndex: 0.18,
      readabilityScore: 42,
      consistencyScore: 72,
    },
    grade: 82,
    feedback: "Strong analysis with good use of evidence. Could expand on solutions.",
    status: "graded",
    submittedAt: "2025-10-12T14:30:00Z",
    gradedAt: "2025-10-15T10:00:00Z",
  },
  {
    id: "sub_2",
    assessmentId: "assess_2",
    studentId: "user_student_2",
    submissionText:
      "Shakespeare's Hamlet is a masterpiece that explores the human condition through the lens of indecision. The titular character embodies the struggle between thought and action, a conflict that resonates across centuries. Hamlet's famous soliloquy poses the fundamental question of existence versus non-existence, but beneath this philosophical inquiry lies a deeper paralysis. He is unable to act decisively against his uncle Claudius despite clear moral justification. This hesitation stems not from cowardice but from an overwhelming awareness of consequences. Shakespeare uses this internal conflict to critique the very nature of Renaissance humanism, where the capacity for deep thought becomes both a gift and a curse.",
    aiMetrics: {
      wordCount: 106,
      sentenceCount: 6,
      avgSentenceLength: 17.7,
      repetitionIndex: 0.12,
      readabilityScore: 35,
      consistencyScore: 68,
    },
    grade: null,
    feedback: null,
    status: "pending",
    submittedAt: "2025-10-14T16:45:00Z",
    gradedAt: null,
  },
  {
    id: "sub_3",
    assessmentId: "assess_1",
    studentId: "user_student_3",
    submissionText:
      "Climate change is bad for the environment. It makes things hotter. Ice melts. Animals die. We need to stop it. People should recycle more and use less energy.",
    aiMetrics: {
      wordCount: 28,
      sentenceCount: 6,
      avgSentenceLength: 4.7,
      repetitionIndex: 0.08,
      readabilityScore: 92,
      consistencyScore: 85,
    },
    grade: null,
    feedback: null,
    status: "pending",
    submittedAt: "2025-10-13T11:00:00Z",
    gradedAt: null,
  },
];

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "notif_1",
    userId: "user_student_1",
    title: "Assessment Graded",
    message:
      'Your submission for "Essay on Climate Change Impacts" has been graded.',
    read: false,
    createdAt: "2025-10-15T10:01:00Z",
  },
  {
    id: "notif_2",
    userId: "user_teacher_1",
    title: "New Submission",
    message:
      'Abhinay Nagireddi submitted an assignment for "Essay on Climate Change Impacts".',
    read: false,
    createdAt: "2025-10-13T11:01:00Z",
  },
  {
    id: "notif_3",
    userId: "user_teacher_2",
    title: "New Submission",
    message:
      'Shaik Afroz submitted an assignment for "Analysis of Shakespeare\'s Hamlet".',
    read: true,
    createdAt: "2025-10-14T16:46:00Z",
  },
];

const SEED_LOGS: SystemLog[] = [
  {
    id: "log_1",
    action: "USER_LOGIN",
    performedBy: "user_admin_1",
    details: "Admin login from IP 192.168.1.1",
    timestamp: "2025-10-15T08:00:00Z",
  },
  {
    id: "log_2",
    action: "ASSESSMENT_CREATED",
    performedBy: "user_teacher_1",
    details: 'Created assessment "Essay on Climate Change Impacts"',
    timestamp: "2025-10-01T09:00:00Z",
  },
  {
    id: "log_3",
    action: "ROLE_CHANGED",
    performedBy: "user_admin_1",
    targetUser: "user_teacher_2",
    details: "Changed role from student to teacher",
    timestamp: "2025-09-15T14:00:00Z",
  },
  {
    id: "log_4",
    action: "SUBMISSION_GRADED",
    performedBy: "user_teacher_1",
    targetUser: "user_student_1",
    details: 'Graded submission for "Essay on Climate Change Impacts" — 82/100',
    timestamp: "2025-10-15T10:00:00Z",
  },
];

// -------------------------------------------------------
// Store
// -------------------------------------------------------

let users = [...SEED_USERS];
let assessments = [...SEED_ASSESSMENTS];
let submissions = [...SEED_SUBMISSIONS];
let notifications = [...SEED_NOTIFICATIONS];
let systemLogs = [...SEED_LOGS];

// Simulated password store (email → hashed password)
const passwords: Record<string, string> = {
  "admin@gradeai.com": "admin123",
  "sravani@gradeai.com": "teacher123",
  "kiran@gradeai.com": "teacher123",
  "abhinay@student.gradeai.com": "student123",
  "afroz@student.gradeai.com": "student123",
  "rihan@student.gradeai.com": "student123",
};

// Event listeners for real-time simulation
type StoreListener = () => void;
const listeners = new Set<StoreListener>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribe(listener: StoreListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// -------------------------------------------------------
// Auth
// -------------------------------------------------------

export function authenticateUser(
  email: string,
  password: string
): User | null {
  const storedPassword = passwords[email];
  if (!storedPassword || storedPassword !== password) return null;
  const user = users.find((u) => u.email === email);
  return user ?? null;
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  role: UserRole
): User | null {
  if (users.some((u) => u.email === email)) return null;
  const now = new Date().toISOString();
  const user: User = {
    id: generateId("user"),
    name,
    email,
    role,
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);
  passwords[email] = password;
  addSystemLog("USER_REGISTERED", user.id, `New ${role} registered: ${email}`);
  emit();
  return user;
}

// -------------------------------------------------------
// Users CRUD
// -------------------------------------------------------

export function getUsers(): User[] {
  return [...users];
}

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function updateUserRole(userId: string, newRole: UserRole, adminId: string): boolean {
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  const oldRole = users[idx].role;
  users[idx] = { ...users[idx], role: newRole, updatedAt: new Date().toISOString() };
  addSystemLog(
    "ROLE_CHANGED",
    adminId,
    `Changed ${users[idx].name} role from ${oldRole} to ${newRole}`,
    userId
  );
  emit();
  return true;
}

export function deleteUser(userId: string, adminId: string): boolean {
  const user = users.find((u) => u.id === userId);
  if (!user) return false;
  users = users.filter((u) => u.id !== userId);
  addSystemLog("USER_DELETED", adminId, `Deleted user: ${user.email}`, userId);
  emit();
  return true;
}

// -------------------------------------------------------
// Assessments CRUD
// -------------------------------------------------------

export function getAssessments(): Assessment[] {
  return [...assessments];
}

export function getAssessmentById(id: string): Assessment | undefined {
  return assessments.find((a) => a.id === id);
}

export function createAssessment(
  data: Omit<Assessment, "id" | "createdAt" | "updatedAt">
): Assessment {
  const now = new Date().toISOString();
  const assessment: Assessment = {
    ...data,
    id: generateId("assess"),
    createdAt: now,
    updatedAt: now,
  };
  assessments.push(assessment);
  addSystemLog(
    "ASSESSMENT_CREATED",
    data.createdBy,
    `Created assessment "${data.title}"`
  );
  // Notify all students
  const students = users.filter((u) => u.role === "student");
  students.forEach((s) => {
    addNotification(
      s.id,
      "New Assessment",
      `A new assessment "${data.title}" has been posted.`
    );
  });
  emit();
  return assessment;
}

export function deleteAssessment(assessmentId: string, teacherId: string): boolean {
  const assessment = assessments.find((a) => a.id === assessmentId);
  if (!assessment) return false;
  assessments = assessments.filter((a) => a.id !== assessmentId);
  submissions = submissions.filter((s) => s.assessmentId !== assessmentId);
  addSystemLog(
    "ASSESSMENT_DELETED",
    teacherId,
    `Deleted assessment "${assessment.title}"`
  );
  emit();
  return true;
}

// -------------------------------------------------------
// Submissions CRUD
// -------------------------------------------------------

export function getSubmissions(): Submission[] {
  return [...submissions];
}

export function getSubmissionsByAssessment(assessmentId: string): Submission[] {
  return submissions.filter((s) => s.assessmentId === assessmentId);
}

export function getSubmissionsByStudent(studentId: string): Submission[] {
  return submissions.filter((s) => s.studentId === studentId);
}

export function createSubmission(
  assessmentId: string,
  studentId: string,
  text: string,
  metrics: AIMetrics
): Submission {
  const submission: Submission = {
    id: generateId("sub"),
    assessmentId,
    studentId,
    submissionText: text,
    aiMetrics: metrics,
    grade: null,
    feedback: null,
    status: "pending",
    submittedAt: new Date().toISOString(),
    gradedAt: null,
  };
  submissions.push(submission);
  // Notify the teacher who created the assessment
  const assessment = assessments.find((a) => a.id === assessmentId);
  const student = users.find((u) => u.id === studentId);
  if (assessment) {
    addNotification(
      assessment.createdBy,
      "New Submission",
      `${student?.name ?? "A student"} submitted "${assessment.title}".`
    );
  }
  addSystemLog(
    "SUBMISSION_CREATED",
    studentId,
    `Submitted assignment for assessment ${assessmentId}`
  );
  emit();
  return submission;
}

export function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback: string,
  teacherId: string
): boolean {
  const idx = submissions.findIndex((s) => s.id === submissionId);
  if (idx === -1) return false;
  submissions[idx] = {
    ...submissions[idx],
    grade,
    feedback,
    status: "graded",
    gradedAt: new Date().toISOString(),
  };
  // Notify student
  const sub = submissions[idx];
  const assessment = assessments.find((a) => a.id === sub.assessmentId);
  addNotification(
    sub.studentId,
    "Assessment Graded",
    `Your submission for "${assessment?.title ?? "an assessment"}" has been graded.`
  );
  addSystemLog(
    "SUBMISSION_GRADED",
    teacherId,
    `Graded submission ${submissionId} — ${grade} points`,
    sub.studentId
  );
  emit();
  return true;
}

// -------------------------------------------------------
// Notifications
// -------------------------------------------------------

export function getNotifications(userId: string): Notification[] {
  return notifications.filter((n) => n.userId === userId);
}

export function addNotification(
  userId: string,
  title: string,
  message: string
): Notification {
  const notif: Notification = {
    id: generateId("notif"),
    userId,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.push(notif);
  emit();
  return notif;
}

export function markNotificationRead(notifId: string): void {
  const idx = notifications.findIndex((n) => n.id === notifId);
  if (idx !== -1) {
    notifications[idx] = { ...notifications[idx], read: true };
    emit();
  }
}

export function markAllNotificationsRead(userId: string): void {
  notifications = notifications.map((n) =>
    n.userId === userId ? { ...n, read: true } : n
  );
  emit();
}

// -------------------------------------------------------
// System Logs
// -------------------------------------------------------

export function getSystemLogs(): SystemLog[] {
  return [...systemLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function addSystemLog(
  action: string,
  performedBy: string,
  details: string,
  targetUser?: string
): void {
  systemLogs.push({
    id: generateId("log"),
    action,
    performedBy,
    targetUser,
    details,
    timestamp: new Date().toISOString(),
  });
}
