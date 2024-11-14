import { google, lucia } from "@/lib/auth";
import kyInstance from "@/lib/ky";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { slugify } from "@/lib/utils";
import {
  generateCodeVerifier,
  generateState,
  OAuth2RequestError,
} from "arctic";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const action = req.nextUrl.searchParams.get("action") || undefined;
  const newCookies = await cookies();

  if (action === "generate-state-and-code-verifier") {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = google.createAuthorizationURL(
      state,
      codeVerifier,
      // this are the scopes, same as what we set in the google cloud console in the OAuth consent screen
      ["profile", "email"],
    );

    newCookies.set("state", state, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });

    newCookies.set("code_verifier", codeVerifier, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });

    return Response.redirect(url);
  }

  const storedCodeVerifier = newCookies.get("code_verifier")?.value;
  const storedState = newCookies.get("state")?.value;

  if (
    !code ||
    !state ||
    !storedCodeVerifier ||
    !storedState ||
    state !== storedState
  ) {
    return new Response(null, { status: 400 });
  }

  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );
    console.log({ tokens });
    const googleUser = await kyInstance
      .get("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      })
      .json<{
        id: string;
        name: string;
        email: string;
        picture: string;
      }>();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleUser.id }, { email: googleUser.email }],
      },
    });

    if (existingUser) {
      // first update the user info
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          googleId: googleUser.id,
          email: googleUser.email,
        },
      });
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);

      newCookies.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );

      // redirect to the home page with the headers
      console.log("Here");
      return new Response(null, {
        status: 302,
        headers: { location: "/" },
      });
    }

    const userId = generateIdFromEntropySize(10);
    const username = slugify(googleUser.name) + "-" + userId.slice(0, 4);

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          displayName: googleUser.name,
          googleId: googleUser.id,
          email: googleUser.email,
          username,
        },
      });
      await streamServerClient.upsertUser({
        id: userId,
        username,
        name: googleUser.name,
      });
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    newCookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // redirect to the home page with the headers
    console.log("Here 2");
    return new Response(null, {
      status: 302,
      headers: { location: "/" },
    });
  } catch (error) {
    console.log(error);
    if (error instanceof OAuth2RequestError) {
      return new Response(null, { status: 400 });
    }

    return new Response(null, { status: 500 });
  }
}
