"use client";

import { useAuth } from "@/lib/auth-context";
import { useStoreSubscription } from "@/hooks/use-store";
import { getUsers, updateUserRole, deleteUser } from "@/lib/store";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, Shield } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import type { UserRole } from "@/lib/types";

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  teacher: "bg-primary/10 text-primary border-primary/20",
  student: "bg-chart-2/10 text-chart-2 border-chart-2/20",
};

export function UserManagement() {
  const { user } = useAuth();
  useStoreSubscription();

  const [deleteDialogUser, setDeleteDialogUser] = useState<string | null>(null);

  if (!user) return null;

  const users = getUsers();
  const deleteTarget = users.find((u) => u.id === deleteDialogUser);

  function handleRoleChange(userId: string, newRole: UserRole) {
    if (userId === user!.id) {
      toast.error("You cannot change your own role.");
      return;
    }
    updateUserRole(userId, newRole, user!.id);
    toast.success("User role updated.");
  }

  function handleDelete() {
    if (!deleteDialogUser || !user) return;
    if (deleteDialogUser === user.id) {
      toast.error("You cannot delete your own account.");
      setDeleteDialogUser(null);
      return;
    }
    deleteUser(deleteDialogUser, user.id);
    toast.success("User deleted.");
    setDeleteDialogUser(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="User Management"
        description="Manage user accounts and role assignments."
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const initials = u.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const isSelf = u.id === user.id;

              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">
                        {u.name}
                        {isSelf && (
                          <span className="ml-1.5 text-xs text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    {isSelf ? (
                      <Badge
                        variant="outline"
                        className={ROLE_COLORS[u.role]}
                      >
                        {u.role}
                      </Badge>
                    ) : (
                      <Select
                        value={u.role}
                        onValueChange={(v) =>
                          handleRoleChange(u.id, v as UserRole)
                        }
                      >
                        <SelectTrigger className="h-7 w-[110px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">student</SelectItem>
                          <SelectItem value="teacher">teacher</SelectItem>
                          <SelectItem value="admin">admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(u.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    {!isSelf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteDialogUser(u.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteDialogUser !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteDialogUser(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogUser(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
