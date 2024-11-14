"use server";

import { lucia, validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import {
  loginSchema,
  signUpSchema,
  TLoginSchema,
  TSignUpSchema,
} from "@/lib/validation";
import { hash, verify } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const signUp = async (credentials: TSignUpSchema) => {
  try {
    const validator = signUpSchema.safeParse(credentials);
    if (!validator.success) {
      return { error: "Failed to validate credentials" };
    }

    const passwordHash = await hash(credentials.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    const [existingUsername, existingEmail] = await Promise.all([
      prisma.user.findFirst({
        where: {
          username: { equals: credentials.username, mode: "insensitive" },
        },
      }),
      prisma.user.findFirst({
        where: { email: { equals: credentials.email, mode: "insensitive" } },
      }),
    ]);

    if (existingUsername) {
      return { error: "Username already exists" };
    }

    if (existingEmail) {
      return { error: "Email already exists" };
    }

    // interactive transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          displayName: credentials.username,
          passwordHash,
          email: credentials.email,
          username: credentials.username,
        },
      });
      await streamServerClient.upsertUser({
        id: userId,
        username: credentials.username,
        name: credentials.username.split(" ")[0],
      });
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    const foundCookies = await cookies();
    foundCookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return redirect("/");
  } catch (error) {
    console.log(error);
    if (isRedirectError(error)) throw error;
    return { error: "Failed to signup. Something went wrong" };
  }
};

export const login = async (credentials: TLoginSchema) => {
  try {
    const validator = loginSchema.safeParse(credentials);
    if (!validator.success) {
      return { error: "Failed to validate credentials" };
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        username: { equals: credentials.username, mode: "insensitive" },
      },
    });

    if (!existingUser || !existingUser?.passwordHash) {
      return { error: "Incorrect username or password" };
    }

    const validatePassword = await verify(
      existingUser.passwordHash,
      credentials.password,
      {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      },
    );

    if (!validatePassword) {
      return { error: "Incorrect username or password" };
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    const foundCookies = await cookies();
    foundCookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return redirect("/");
  } catch (error) {
    console.log(error);
    if (isRedirectError(error)) throw error;
    return { error: "Failed to login. Something went wrong" };
  }
};

export const logout = async () => {
  const { session } = await validateRequest();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  const newCookies = await cookies();
  newCookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return redirect("/");
};
