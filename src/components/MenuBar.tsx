import { buttonVariants } from "@/components/ui/button";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { Bookmark, Home } from "lucide-react";
import Link from "next/link";
import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";

interface MenuBarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenuBarProps) {
  const { user } = await validateRequest();
  if (!user) return null;

  const [unreadNotificationsCount, unreadMessagesCount] = await Promise.all([
    prisma.notification.count({
      where: { recipientId: user.id, read: false },
    }),
    (await streamServerClient.getUnreadCount(user.id)).total_unread_count,
  ]);

  return (
    <div className={className}>
      <Link
        href="/"
        className={buttonVariants({
          variant: "ghost",
          className: "flex items-center !justify-start gap-3",
        })}
        title="Home"
      >
        <Home />
        <span className="hidden lg:inline">Home</span>
      </Link>
      <NotificationsButton
        initialData={{ unreadCount: unreadNotificationsCount }}
      />
      <MessagesButton initialData={{ unreadCount: unreadMessagesCount }} />
      <Link
        title="Bookmarks"
        href="/bookmarks"
        className={buttonVariants({
          variant: "ghost",
          className: "flex items-center !justify-start gap-3",
        })}
      >
        <Bookmark />
        <span className="hidden lg:inline">Bookmarks</span>
      </Link>
    </div>
  );
}
