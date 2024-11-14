"use server";

import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema, TCreatePostSchema } from "@/lib/validation";

export const submitPost = async (payload: TCreatePostSchema) => {
  try {
    const { user } = await validateRequest();
    if (!user) throw new Error("Unauthorized");

    const validator = createPostSchema.safeParse(payload);
    if (!validator.success) return { error: "Invalid payload" };

    const newPost = await prisma.post.create({
      data: {
        content: payload.content,
        userId: user.id,
        ...(!!payload.mediaIds.length && {
          medias: { connect: payload.mediaIds.map((id) => ({ id })) },
        }),
      },
      include: getPostDataInclude(user.id),
    });

    return { data: newPost };
  } catch (error) {
    console.log(error);
    return { error: "Failed to create post" };
  }
};

export async function deletePost(postId: string) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId, userId: user.id },
    });

    if (!post) throw new Error("Post not found");

    const deletedPost = await prisma.post.delete({
      where: { id: postId },
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    return { data: deletedPost };
  } catch (error) {
    console.log(error);
    return { error: "Failed to delete post" };
  }
}
