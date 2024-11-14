import { validateRequest } from "@/lib/auth";
import FollowButton from "@/components/FollowButton";
import FollowerCount from "@/components/FollowerCount";
import Linkify from "@/components/Linkify";
import TrendsSidebar from "@/components/TrendsSidebar";
import UserAvatar from "@/components/UserAvatar";
import prisma from "@/lib/prisma";
import { FollowerInfo, getUserDataSelect } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { formatDate } from "date-fns";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Feeds from "@/components/Feeds";
import EditProfile from "@/components/EditProfile";

interface PageProps {
  params: Promise<{ username: string }>;
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedInUserId),
  });

  if (!user) notFound();
  return user;
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) return {};

  const user = await getUser(username, loggedInUser.id);

  return {
    title: `${user.displayName} (@${user.username})`,
  };
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        {"You're"} not authorized to view this page.
      </p>
    );
  }

  const user = await getUser(username, loggedInUser.id);

  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUser.id,
    ),
  };

  return (
    <>
      <div className="w-full min-w-0 space-y-5">
        <aside className="h-fit w-full space-y-5 rounded-2xl bg-card p-5 shadow-sm">
          <UserAvatar
            avatarUrl={user.avatarUrl}
            size={250}
            className="mx-auto size-full max-h-60 max-w-60 rounded-full"
          />
          <div className="flex flex-wrap gap-3 sm:flex-nowrap">
            <div className="me-auto space-y-2">
              <div>
                <h1 className="text-3xl font-bold">{user.displayName}</h1>
                <div className="text-muted-foreground">@{user.username}</div>
              </div>
              <div>
                Member since{" "}
                <span className="font-semibold text-primary">
                  {formatDate(user.createdAt, "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                Posts :{" "}
                <span className="text-lg font-semibold text-primary">
                  {formatNumber(user._count.posts)}
                </span>
                <FollowerCount userId={user.id} initialState={followerInfo} />
              </div>
            </div>
            {user.id === loggedInUser.id ? (
              <EditProfile user={user} />
            ) : (
              <FollowButton userId={user.id} initialState={followerInfo} />
            )}
          </div>
          {user.bio && (
            <>
              <hr />
              <Linkify>
                <div className="overflow-hidden whitespace-pre-line break-words">
                  {user.bio}
                </div>
              </Linkify>
            </>
          )}
        </aside>

        <aside className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName}&apos;s posts
          </h2>
        </aside>
        <Feeds type="user-feeds" userId={user.id} />
      </div>
      <TrendsSidebar />
    </>
  );
}
