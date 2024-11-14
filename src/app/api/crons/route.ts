import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { UTApi } from "uploadthing/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  console.log({ authHeader });
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type");

  try {
    switch (type) {
      case "clear-uploads":
        // add 24hrs to the current date;
        const datePlus24Hrs = new Date(Date.now() + 1000 * 60 * 60 * 24);
        const unusedMedias = await prisma.media.findMany({
          where: {
            postId: null,
            ...(process.env.NODE_ENV === "production"
              ? { createdAt: { gte: datePlus24Hrs } }
              : {}),
          },
          select: { id: true, url: true },
        });

        await Promise.all([
          new UTApi().deleteFiles(
            unusedMedias.map((m) => {
              return m.url.split(
                `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
              )[1];
            }),
          ),
          prisma.media.deleteMany({
            where: { id: { in: unusedMedias.map((m) => m.id) } },
          }),
        ]);

        return new Response();
      default:
        return new Response("Invalid Cron type", { status: 400 });
    }
  } catch (error) {
    console.log(error);
    return new Response("Internal server error", { status: 500 });
  }
}
