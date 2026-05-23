"use client";

import { useStoreSubscription } from "@/hooks/use-store";
import { getSystemLogs, getUsers } from "@/lib/store";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const ACTION_COLORS: Record<string, string> = {
  USER_LOGIN: "bg-chart-1/10 text-chart-1",
  USER_REGISTERED: "bg-success/10 text-success",
  ASSESSMENT_CREATED: "bg-primary/10 text-primary",
  ASSESSMENT_DELETED: "bg-destructive/10 text-destructive",
  SUBMISSION_CREATED: "bg-chart-2/10 text-chart-2",
  SUBMISSION_GRADED: "bg-success/10 text-success",
  ROLE_CHANGED: "bg-warning/10 text-warning",
  USER_DELETED: "bg-destructive/10 text-destructive",
};

export function SystemLogs() {
  useStoreSubscription();

  const logs = getSystemLogs();
  const users = getUsers();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="System Logs"
        description="Audit trail of all system actions and events."
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Performed By</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const performer = users.find((u) => u.id === log.performedBy);
              const target = log.targetUser
                ? users.find((u) => u.id === log.targetUser)
                : null;
              const colorClass =
                ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground";

              return (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground text-xs font-mono">
                    {format(
                      new Date(log.timestamp),
                      "yyyy-MM-dd HH:mm:ss"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${colorClass} border-transparent`}
                    >
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {performer?.name ?? log.performedBy}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {target?.name ?? log.targetUser ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                    {log.details}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
