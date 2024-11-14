import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FollowerInfo, getUserDataSelect } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 400 });
    }
    const { userId } = await context.params;
    const action = req.nextUrl.searchParams.get("action") || undefined;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: getUserDataSelect(loggedInUser.id),
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    switch (action) {
      case "follower-info": {
        const data: FollowerInfo = {
          followers: user._count.followers,
          isFollowedByUser: !!user.followers.length,
        };
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

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 400 });
    }

    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get("action") || "";
    const { userId } = await context.params;

    const foundUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!foundUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (foundUser.id === loggedInUser.id) {
      return Response.json({ error: "Forbidden action" }, { status: 403 });
    }

    const followData = {
      followerId: loggedInUser.id,
      followingId: foundUser.id,
    };

    switch (action) {
      case "follow":
        await prisma.$transaction([
          prisma.follow.upsert({
            where: { followerId_followingId: followData },
            create: followData,
            update: {},
          }),
          prisma.notification.create({
            data: {
              issuerId: loggedInUser.id,
              recipientId: foundUser.id,
              type: "FOLLOW",
              content: `${loggedInUser.displayName} followed you`,
            },
          }),
        ]);
        return new Response();
      case "unfollow":
        await prisma.$transaction([
          prisma.follow.deleteMany({
            where: followData,
          }),
          prisma.notification.deleteMany({
            where: { issuerId: loggedInUser.id, recipientId: foundUser.id },
          }),
        ]);
        return new Response();
      default:
        return Response.json({ error: "Forbidden Action" }, { status: 403 });
    }
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
