import FollowButton from "@/components/FollowButton";
import Linkify from "@/components/Linkify";
import Post from "@/components/posts/Post";
import UserAvatar from "@/components/UserAvatar";
import UserTooltip from "@/components/UserTooltip";
import { validateRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, UserData } from "@/lib/types";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

interface PageProps {
  params: Promise<{ postId: string }>;
}

const getPost = cache(async (postId: string, loggedInUserId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: getPostDataInclude(loggedInUserId),
  });

  if (!post) notFound();
  return post;
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { postId } = await params;
  const { user } = await validateRequest();
  if (!user) return {};

  const post = await getPost(postId, user.id);

  return {
    title: `${post.user.displayName}: ${post.content.slice(0, 50)}...`,
  };
}

export default async function Page({ params }: PageProps) {
  const { postId } = await params;
  const { user } = await validateRequest();

  if (!user) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const post = await getPost(postId, user.id);

  return (
    <>
      <div className="w-full min-w-0 space-y-5">
        <Post post={post} />
      </div>
      <div className="sticky top-[5.25rem] hidden h-fit w-80 flex-none lg:block">
        <UserInfoSidebar postUser={post.user} loggedInUserId={user.id} />
      </div>
    </>
  );
}

interface UserInfoSidebarProps {
  postUser: UserData;
  loggedInUserId: string;
}

async function UserInfoSidebar({
  postUser,
  loggedInUserId,
}: UserInfoSidebarProps) {
  return (
    <div className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">About this user</div>
      <UserTooltip user={postUser}>
        <Link
          href={`/users/${postUser.username}`}
          className="flex items-center gap-3"
        >
          <UserAvatar avatarUrl={postUser.avatarUrl} className="flex-none" />
          <div>
            <p className="line-clamp-1 break-all font-semibold hover:underline">
              {postUser.displayName}
            </p>
            <p className="line-clamp-1 break-all text-muted-foreground">
              @{postUser.username}
            </p>
          </div>
        </Link>
      </UserTooltip>
      {postUser?.bio && (
        <Linkify>
          <div className="line-clamp-6 whitespace-pre-line break-words text-muted-foreground">
            {postUser.bio}
          </div>
        </Linkify>
      )}
      {postUser.id !== loggedInUserId && (
        <FollowButton
          userId={postUser.id}
          initialState={{
            followers: postUser._count.followers,
            isFollowedByUser: postUser.followers.some(
              ({ followerId }) => followerId === loggedInUserId,
            ),
          }}
        />
      )}
    </div>
  );
}
