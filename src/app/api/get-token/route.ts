import { validateRequest } from "@/lib/auth";
import streamServerClient from "@/lib/stream";

export async function GET() {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) return new Response("Unauthorized", { status: 401 });

    console.log("Calling get token for user", loggedInUser.id);

    // current time in seconds + 1 hour
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;
    // current time in seconds - 1 minute
    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    const token = streamServerClient.createToken(
      loggedInUser.id,
      expirationTime,
      issuedAt,
    );

    return Response.json({ token });
  } catch (error) {
    console.log(error);
    return new Response("Internal server error", { status: 500 });
  }
}
