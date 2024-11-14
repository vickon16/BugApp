"use client";

import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import InfiniteScrollContainer from "./InfiniteScrollContainer";
import Post from "./posts/Post";
import PostsLoadingSkeleton from "./skeleton/PostsLoadingSkeleton";

type CombinedProps =
  | { type: "for-you"; userId?: never }
  | { type: "following"; userId?: never }
  | { type: "user-feeds"; userId: string }
  | { type: "bookmarks"; userId?: never };

type Props = CombinedProps;

const Feeds = ({ type, userId }: Props) => {
  const commonKey = ["post-feed", type];
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: !userId ? commonKey : [...commonKey, userId],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(`/api/posts`, {
          searchParams: {
            action: type,
            ...(type === "user-feeds" && userId && { userId }),
            ...(pageParam && { cursor: pageParam }),
          },
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = data?.pages?.flatMap((page) => page.posts) || [];

  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        {type === "for-you"
          ? "No one has posted yet."
          : type === "user-feeds"
            ? "This user has not posted any thing yet."
            : type === "bookmarks"
              ? "You haven't added any bookmarks yet"
              : "No post found. Start following to see their posts"}
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    );
  }
  return (
    <InfiniteScrollContainer
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
      className="space-y-4"
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
      {isFetchingNextPage && (
        <Loader2 className="mx-auto my-3 animate-spin text-primary" />
      )}
    </InfiniteScrollContainer>
  );
};

export default Feeds;
