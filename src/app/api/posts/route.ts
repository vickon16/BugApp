import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const action = req.nextUrl.searchParams.get("action") || undefined;
    const userId = req.nextUrl.searchParams.get("userId") || undefined;
    const pageSize = 10;

    let posts;
    switch (action) {
      case "for-you": {
        posts = await prisma.post.findMany({
          include: getPostDataInclude(loggedInUser.id),
          orderBy: { createdAt: "desc" },
          take: pageSize + 1,
          cursor: cursor ? { id: cursor } : undefined,
        });
        break;
      }
      case "following": {
        posts = await prisma.post.findMany({
          where: {
            user: { followers: { some: { followerId: loggedInUser.id } } },
          },
          include: getPostDataInclude(loggedInUser.id),
          orderBy: { createdAt: "desc" },
          take: pageSize + 1,
          cursor: cursor ? { id: cursor } : undefined,
        });
        break;
      }
      case "user-feeds": {
        if (!userId)
          return Response.json({ error: "Invalid action" }, { status: 400 });
        posts = await prisma.post.findMany({
          where: { userId },
          include: getPostDataInclude(loggedInUser.id),
          orderBy: { createdAt: "desc" },
          take: pageSize + 1,
          cursor: cursor ? { id: cursor } : undefined,
        });
        break;
      }
      case "bookmarks": {
        const bookmarks = await prisma.bookmark.findMany({
          where: { userId: loggedInUser.id },
          include: { post: { include: getPostDataInclude(loggedInUser.id) } },
          orderBy: { createdAt: "desc" },
          take: pageSize + 1,
          cursor: cursor ? { id: cursor } : undefined,
        });

        // check if there is a next cursor
        const nextCursor =
          bookmarks.length > pageSize ? bookmarks[pageSize].id : null;
        const data: PostsPage = {
          posts: bookmarks.slice(0, pageSize).map((b) => b.post),
          nextCursor,
        };

        return Response.json(data);
      }
      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    // check if there is a next cursor
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;
    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
