import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  NotificationCountInfo,
  notificationsInclude,
  NotificationsPage,
} from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 400 });
    }

    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const action = req.nextUrl.searchParams.get("action") || "";
    const pageSize = 10;

    switch (action) {
      case "get-all": {
        const notifications = await prisma.notification.findMany({
          where: { recipientId: loggedInUser.id },
          include: notificationsInclude,
          orderBy: { createdAt: "desc" },
          take: pageSize + 1,
          cursor: cursor ? { id: cursor } : undefined,
        });

        // check if there is a next cursor
        const nextCursor =
          notifications.length > pageSize ? notifications[pageSize].id : null;
        const data: NotificationsPage = {
          notifications: notifications.slice(0, pageSize),
          nextCursor,
        };

        return Response.json(data);
      }
      case "get-unread-count": {
        const unreadCount = await prisma.notification.count({
          where: { recipientId: loggedInUser.id, read: false },
        });

        const data: NotificationCountInfo = { unreadCount };
        return Response.json(data);
      }
      default:
        return Response.json({ error: "Forbidden action" }, { status: 403 });
    }
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 400 });
    }

    const action = req.nextUrl.searchParams.get("action") || "";

    switch (action) {
      case "mark-as-read": {
        await prisma.notification.updateMany({
          where: { recipientId: loggedInUser.id, read: false },
          data: { read: true },
        });

        return new Response();
      }
      default:
        return Response.json({ error: "Forbidden action" }, { status: 403 });
    }
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
