"use client";

import { buttonVariants } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { NotificationCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";

interface NotificationsButtonProps {
  initialData: NotificationCountInfo;
}

export default function NotificationsButton({
  initialData,
}: NotificationsButtonProps) {
  const { data } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: () =>
      kyInstance
        .get("/api/notifications?action=get-unread-count")
        .json<NotificationCountInfo>(),
    initialData,
    refetchInterval: 60 * 1000,
  });

  return (
    <Link
      href="/notifications"
      title="Notifications"
      className={buttonVariants({
        variant: "ghost",
        className: "flex items-center !justify-start gap-3",
      })}
    >
      <div className="relative">
        <Bell />
        {!!data.unreadCount && (
          <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-xs font-medium tabular-nums text-primary-foreground">
            {data.unreadCount}
          </span>
        )}
      </div>
      <span className="hidden lg:inline">Notifications</span>
    </Link>
  );
}
