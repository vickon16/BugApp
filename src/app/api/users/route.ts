import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 400 });
    }

    const action = req.nextUrl.searchParams.get("action") || "";
    const userId = req.nextUrl.searchParams.get("userId") || "";
    const username = req.nextUrl.searchParams.get("username") || "";

    switch (action) {
      case "get-all-users": {
        const users = await prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          select: getUserDataSelect(loggedInUser.id),
        });

        return Response.json(users);
      }
      case "get-user-by-id": {
        if (!userId)
          return Response.json({ error: "UserId not found" }, { status: 404 });
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: getUserDataSelect(loggedInUser.id),
        });

        if (!user)
          return Response.json({ error: "User not found" }, { status: 404 });

        return Response.json(user);
      }
      case "get-user-by-username": {
        if (!username)
          return Response.json(
            { error: "Username not found" },
            { status: 404 },
          );
        const user = await prisma.user.findFirst({
          where: { username: { equals: username, mode: "insensitive" } },
          select: getUserDataSelect(loggedInUser.id),
        });

        if (!user)
          return Response.json({ error: "User not found" }, { status: 404 });

        return Response.json(user);
      }
      default:
        return Response.json({ error: "Forbidden action" }, { status: 403 });
    }
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
