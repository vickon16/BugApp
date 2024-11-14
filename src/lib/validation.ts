import * as z from "zod";

const requiredString = z.string().trim().min(1, "Required");

export const signUpSchema = z.object({
  username: requiredString.regex(
    /^[a-zA-Z0-9_]+$/,
    "Only letters, numbers and underscores",
  ),
  email: requiredString.email("Invalid email"),
  password: requiredString.min(8, "Must be at least 8 characters"),
});

export type TSignUpSchema = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  username: requiredString,
  password: requiredString,
});

export type TLoginSchema = z.infer<typeof loginSchema>;

export const createPostSchema = z.object({
  content: requiredString,
  mediaIds: z
    .array(z.string())
    .max(5, "Cannot have more than 5 media attachments"),
});

export type TCreatePostSchema = z.infer<typeof createPostSchema>;

export const updateUserProfileSchema = z.object({
  displayName: requiredString,
  bio: z.string().max(1000, "Must be at most 1000 characters"),
});

export type TUpdateUserProfileSchema = z.infer<typeof updateUserProfileSchema>;

export const commentSchema = z.object({
  postId: requiredString,
  content: requiredString,
});

export type TCommentSchema = z.infer<typeof commentSchema>;
