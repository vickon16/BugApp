import { validateRequest } from "@/lib/auth";
import streamServerClient from "@/lib/stream";
import { MessageCountInfo } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 400 });
    }

    const action = req.nextUrl.searchParams.get("action") || "";

    switch (action) {
      case "get-unread-count": {
        const { total_unread_count } = await streamServerClient.getUnreadCount(
          loggedInUser.id,
        );

        const data: MessageCountInfo = { unreadCount: total_unread_count };
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
