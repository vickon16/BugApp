import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { BookmarkInfo, LikeInfo } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await context.params;
    const action = req.nextUrl.searchParams.get("action");
    const dataInfo = { userId: loggedInUser.id, postId };

    switch (action) {
      case "post-liked-info": {
        const post = await prisma.post.findUnique({
          where: { id: postId },
          select: {
            likes: {
              where: { userId: loggedInUser.id },
              select: { userId: true },
            },
            _count: { select: { likes: true } },
          },
        });

        if (!post)
          return Response.json({ message: "Post not found" }, { status: 404 });

        const data: LikeInfo = {
          likes: post._count.likes,
          isLikedByUser: !!post.likes.length,
        };

        return Response.json(data);
      }
      case "post-bookmarked-info": {
        const bookmark = await prisma.bookmark.findUnique({
          where: { userId_postId: dataInfo },
        });

        const data: BookmarkInfo = {
          isBookmarkedByUser: !!bookmark,
        };

        return Response.json(data);
      }
      default: {
        return Response.json({ error: "Invalid action" }, { status: 403 });
      }
    }
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> },
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await context.params;
    const action = req.nextUrl.searchParams.get("action") || undefined;
    const dataInfo = { userId: loggedInUser.id, postId };

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { user: { select: { id: true, username: true } } },
    });

    if (!post)
      return Response.json({ error: "Post not found" }, { status: 404 });

    switch (action) {
      case "like": {
        await prisma.$transaction([
          prisma.like.upsert({
            where: { userId_postId: dataInfo },
            create: dataInfo,
            update: {},
          }),
          ...(post.user.id !== loggedInUser.id
            ? [
                prisma.notification.create({
                  data: {
                    issuerId: loggedInUser.id,
                    recipientId: post.user.id,
                    postId,
                    type: "LIKE",
                    content: `${loggedInUser.displayName} liked your post`,
                  },
                }),
              ]
            : []),
        ]);
        return new Response();
      }
      case "dislike": {
        await prisma.$transaction([
          prisma.like.deleteMany({
            where: { userId: dataInfo.userId, postId: dataInfo.postId },
          }),
          prisma.notification.deleteMany({
            where: { issuerId: loggedInUser.id, recipientId: post.user.id },
          }),
        ]);
        return new Response();
      }
      case "bookmark": {
        await prisma.bookmark.upsert({
          where: { userId_postId: dataInfo },
          create: dataInfo,
          update: {},
        });
        return new Response();
      }
      case "un-bookmark": {
        await prisma.bookmark.deleteMany({
          where: { userId: dataInfo.userId, postId: dataInfo.postId },
        });
        return new Response();
      }
      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
