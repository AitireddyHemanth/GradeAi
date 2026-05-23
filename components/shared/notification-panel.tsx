"use client";

import { useAuth } from "@/lib/auth-context";
import { useStoreSubscription } from "@/hooks/use-store";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Check, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function NotificationPanel() {
  const { user } = useAuth();
  useStoreSubscription();

  if (!user) return null;

  const notifications = getNotifications(user.id).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Notifications
          </h2>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllNotificationsRead(user.id)}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={
                notif.read
                  ? "opacity-70"
                  : "border-primary/20 bg-primary/[0.03]"
              }
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    notif.read ? "bg-muted" : "bg-primary/10"
                  }`}
                >
                  <Bell
                    className={`h-4 w-4 ${
                      notif.read ? "text-muted-foreground" : "text-primary"
                    }`}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <button
                        onClick={() => markNotificationRead(notif.id)}
                        className="shrink-0 rounded p-1 text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
