"use server";

import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getCommentDataInclude } from "@/lib/types";
import { commentSchema, TCommentSchema } from "@/lib/validation";

export async function submitComment(payload: TCommentSchema) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) throw new Error("Unauthorized");

    const validator = commentSchema.safeParse(payload);
    if (!validator.success) return { error: "Invalid payload" };

    const foundPost = await prisma.post.findUnique({
      where: { id: payload.postId },
    });

    if (!foundPost) return { error: "post not found" };

    const [newComment] = await prisma.$transaction([
      prisma.comment.create({
        data: { ...payload, userId: loggedInUser.id },
        include: getCommentDataInclude(loggedInUser.id),
      }),
      ...(loggedInUser.id !== foundPost.userId
        ? [
            prisma.notification.create({
              data: {
                issuerId: loggedInUser.id,
                recipientId: foundPost.userId,
                postId: foundPost.id,
                type: "COMMENT",
                content: `${loggedInUser.displayName} commented on your post`,
              },
            }),
          ]
        : []),
    ]);

    return { data: newComment };
  } catch (error) {
    console.log(error);
    return { error: "Internal server error" };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized");

    const foundComment = await prisma.comment.findUnique({
      where: { id: commentId, userId: user.id },
    });

    if (!foundComment) return { error: "Comment not found" };

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return { data: commentId };
  } catch (error) {
    console.log(error);
    return { error: "Internal server error" };
  }
}
