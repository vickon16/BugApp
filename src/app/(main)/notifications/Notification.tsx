import UserAvatar from "@/components/UserAvatar";
import { NotificationData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NotificationType } from "@prisma/client";
import { Heart, MessageCircle, MonitorCog, User2 } from "lucide-react";
import Link from "next/link";

interface NotificationProps {
  notification: NotificationData;
}

export default function Notification({ notification }: NotificationProps) {
  const notificationTypeMap: Record<
    NotificationType,
    { icon: JSX.Element; href?: string }
  > = {
    FOLLOW: {
      icon: <User2 className="size-7 text-primary" />,
      href: notification.issuer ? `/users/${notification.issuer.username}` : "",
    },
    COMMENT: {
      icon: <MessageCircle className="size-7 fill-primary text-primary" />,
      href: `/posts/${notification.postId}`,
    },
    LIKE: {
      icon: <Heart className="size-7 fill-red-500 text-red-500" />,
      href: `/posts/${notification.postId}`,
    },
    SYSTEM: {
      icon: <MonitorCog className="size-7 text-primary" />,
      href: "",
    },
  };

  const { icon, href } = notificationTypeMap[notification.type];

  return !!href ? (
    <Link href={href} className="block">
      <NotificationContent notification={notification} icon={icon} />
    </Link>
  ) : (
    <NotificationContent notification={notification} icon={icon} />
  );
}

interface NotificationContentProps {
  notification: NotificationData;
  icon: JSX.Element;
}

export const NotificationContent = ({
  notification,
  icon,
}: NotificationContentProps) => {
  return (
    <article
      className={cn(
        "flex flex-col gap-2 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
        !notification.read && "border bg-primary/10",
      )}
    >
      <div className="flex items-center gap-2">
        <UserAvatar avatarUrl={notification?.issuer?.avatarUrl} size={36} />
        <span>
          <span className="text-xs text-muted-foreground">from{" => "}</span>
          <span className="bg-secondary px-2 py-1 text-sm font-semibold">
            {notification.issuer ? notification.issuer.displayName : "SYSTEM"}
          </span>
        </span>
        <div className="my-1">{icon}</div>
      </div>
      <div>{notification.content}</div>
      {notification.post && (
        <div className="line-clamp-3 whitespace-pre-line text-muted-foreground">
          {notification.post.content}
        </div>
      )}
    </article>
  );
};
