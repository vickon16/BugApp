"use client";

import { cn, formatRelativeDate } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Comments from "@/components/comments/Comments";
import Linkify from "@/components/Linkify";
import UserAvatar from "../UserAvatar";
import { useSession } from "../providers/SessionProvider";
import { PostData } from "@/lib/types";
import UserTooltip from "../UserTooltip";
// import BookmarkButton from "./BookmarkButton";
import LikeButton from "@/components/LikeButton";
import PostMoreButton from "./PostMoreButton";
import { Media } from "@prisma/client";
import BookmarkButton from "../BookmarkButton";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();
  const [showComments, setShowComments] = useState(false);

  return (
    <article className="group/post space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex justify-between gap-3">
        <UserTooltip user={post.user}>
          <div className="flex flex-wrap gap-3">
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
            <div>
              <Link
                href={`/users/${post.user.username}`}
                className="block font-medium hover:underline"
              >
                {post.user.displayName}
              </Link>
              <Link
                href={`/posts/${post.id}`}
                className="block text-sm text-muted-foreground hover:underline"
              >
                {formatRelativeDate(post.createdAt)}
              </Link>
            </div>
          </div>
        </UserTooltip>
        {post.user.id === user.id && (
          <PostMoreButton
            post={post}
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>
      <Linkify>
        <div className="whitespace-pre-line break-words">{post.content}</div>
      </Linkify>
      {!!post.medias.length && <MediaPreviews medias={post.medias} />}
      <hr className="text-muted-foreground" />
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialData={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some((like) => like.userId === user.id),
            }}
          />
          <CommentButton
            post={post}
            onClick={() => setShowComments((prev) => !prev)}
          />
        </div>
        <BookmarkButton
          postId={post.id}
          initialData={{
            isBookmarkedByUser: post.bookmarks.some(
              (bookmark) => bookmark.userId === user.id,
            ),
          }}
        />
      </div>
      {showComments && <Comments postId={post.id} />}
    </article>
  );
}

interface MediaPreviewsProps {
  medias: Media[];
}

function MediaPreviews({ medias }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        medias.length > 1 && "sm:grid sm:grid-cols-2",
      )}
    >
      {medias.map((m) => (
        <div className="size-full" key={m.id}>
          {m.type === "IMAGE" ? (
            <Image
              src={m.url}
              alt="Media"
              width={500}
              height={500}
              className="mx-auto size-full max-h-[30rem] rounded-2xl"
            />
          ) : m.type === "VIDEO" ? (
            <div>
              <video
                src={m.url}
                controls
                className="mx-auto size-full max-h-[30rem] rounded-2xl"
              />
            </div>
          ) : (
            <p className="text-destructive">Unsupported media type</p>
          )}
        </div>
      ))}
    </div>
  );
}

interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {post?._count?.comments ?? 0}{" "}
        <span className="hidden sm:inline">comments</span>
      </span>
    </button>
  );
}
