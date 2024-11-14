"use client";

import { buttonVariants } from "@/components/ui/button";
import kyInstance from "@/lib/ky";
import { MessageCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import Link from "next/link";

interface MessagesButtonProps {
  initialData: MessageCountInfo;
}

export default function MessagesButton({ initialData }: MessagesButtonProps) {
  const { data } = useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: () =>
      kyInstance
        .get("/api/messages?action=get-unread-count")
        .json<MessageCountInfo>(),
    initialData: initialData,
    refetchInterval: 60 * 1000,
  });

  return (
    <Link
      title="Messages"
      href="/messages"
      className={buttonVariants({
        variant: "ghost",
        className: "flex items-center !justify-start gap-3",
      })}
    >
      <div className="relative">
        <Mail />
        {!!data.unreadCount && (
          <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-xs font-medium tabular-nums text-primary-foreground">
            {data.unreadCount}
          </span>
        )}
      </div>
      <span className="hidden lg:inline">Messages</span>
    </Link>
  );
}
