"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@/lib/types";
import { BookOpen, Eye, EyeOff } from "lucide-react";

type AuthMode = "login" | "register";

export function LoginForm() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "login") {
      const result = login(email, password);
      if (!result.success) {
        setError(result.error ?? "Login failed.");
      }
    } else {
      const result = register(name, email, password, role);
      if (!result.success) {
        setError(result.error ?? "Registration failed.");
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <BookOpen className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            GradeAI
          </h1>
          <p className="text-sm text-muted-foreground">
            Assignment Evaluation & Writing Analysis
          </p>
        </div>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Sign in to your account to continue"
              : "Register to start using the platform"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@gradeai.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as UserRole)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full">
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                {"Don't have an account? "}
                <button
                  type="button"
                  className="text-primary underline-offset-4 hover:underline font-medium"
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-primary underline-offset-4 hover:underline font-medium"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>

          <div className="mt-6 border-t pt-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground text-center">
              Quick access demo accounts
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => {
                  setEmail("abhinay@student.gradeai.com");
                  setPassword("student123");
                  setMode("login");
                }}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-chart-2/20 text-[10px] font-bold text-chart-2">
                  S
                </span>
                Student — abhinay@student.gradeai.com
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => {
                  setEmail("sravani@gradeai.com");
                  setPassword("teacher123");
                  setMode("login");
                }}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-chart-1/20 text-[10px] font-bold text-chart-1">
                  T
                </span>
                Teacher — sravani@gradeai.com
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => {
                  setEmail("admin@gradeai.com");
                  setPassword("admin123");
                  setMode("login");
                }}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-chart-3/20 text-[10px] font-bold text-chart-3">
                  A
                </span>
                Admin — admin@gradeai.com
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
