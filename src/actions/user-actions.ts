"use server";

import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { getUserDataSelect } from "@/lib/types";
import {
  TUpdateUserProfileSchema,
  updateUserProfileSchema,
} from "@/lib/validation";

export async function updateUserProfile(values: TUpdateUserProfileSchema) {
  const validator = updateUserProfileSchema.safeParse(values);
  if (!validator.success) return { error: "Invalid payload" };

  try {
    const { user } = await validateRequest();
    if (!user) return { error: "Unauthorized" };

    // interactive transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: values,
        select: getUserDataSelect(user.id),
      });
      await streamServerClient.partialUpdateUser({
        id: user.id,
        set: { name: values.displayName },
      });

      return updatedUser;
    });

    return { data: updatedUser };
  } catch (error) {
    console.log(error);
    return { error: "Internal server error" };
  }
}
