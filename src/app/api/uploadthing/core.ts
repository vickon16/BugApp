import { validateRequest } from "@/lib/auth";
import { MAX_FILE_UPLOAD } from "@/lib/constants";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { createUploadthing, FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";

const f = createUploadthing();

export const fileRouter = {
  avatar: f({ image: { maxFileSize: "512KB" } })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");

      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // this code runs on the server

      // we first delete the old avatar from the storage
      const oldAvatarUrl = metadata.user.avatarUrl;
      if (!!oldAvatarUrl) {
        const key = oldAvatarUrl.split(
          `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
        )[1];

        await new UTApi().deleteFiles(key);
      }

      // by default, we get this url format from the uploadthing server
      // "https://utfs.io/f/<FILE_KEY>"

      // we have to change it to our format for security reasons, our format should look like this "https://utfs.io/a/<APP_ID>/<FILE_KEY>"
      // so we can use the app id to check if the file is from our app or not
      // also remember to change the remote patterns in the next.config.js file

      const newAvatarUrl = file.url.replace(
        "/f/",
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
      );

      await Promise.all([
        prisma.user.update({
          where: { id: metadata.user.id },
          data: { avatarUrl: newAvatarUrl },
        }),
        streamServerClient.partialUpdateUser({
          id: metadata.user.id,
          set: { image: newAvatarUrl },
        }),
      ]);

      return { avatarUrl: newAvatarUrl };
    }),
  media: f({
    image: { maxFileSize: "4MB", maxFileCount: MAX_FILE_UPLOAD },
    video: { maxFileSize: "64MB", maxFileCount: MAX_FILE_UPLOAD },
  })
    .middleware(async () => {
      const { user } = await validateRequest();
      if (!user) throw new UploadThingError("Unauthorized");

      return { user };
    })
    .onUploadComplete(async ({ file }) => {
      // this code runs on the server

      // by default, we get this url format from the uploadthing server
      // "https://utfs.io/f/<FILE_KEY>"

      // we have to change it to our format for security reasons, our format should look like this "https://utfs.io/a/<APP_ID>/<FILE_KEY>"
      // so we can use the app id to check if the file is from our app or not
      // also remember to change the remote patterns in the next.config.js file
      const newMediaUrl = file.url.replace(
        "/f/",
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
      );

      const media = await prisma.media.create({
        data: {
          url: newMediaUrl,
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });

      return { mediaId: media.id };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
