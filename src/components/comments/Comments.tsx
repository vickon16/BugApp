import kyInstance from "@/lib/ky";
import { CommentsPage } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import Comment from "./Comment";
import CommentInput from "./CommentInput";

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          `/api/posts/${postId}/comments`,
          pageParam ? { searchParams: { cursor: pageParam } } : {},
        )
        .json<CommentsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (firstPage) => firstPage.previousCursor,
    // this "select" function is used to map the data from the API to the shape we want
    select: (data) => ({
      pages: [...data.pages].reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
  });

  const comments = data?.pages.flatMap((page) => page.comments) || [];

  return (
    <div className="mt-2 max-h-[400px] space-y-3 overflow-y-auto">
      <CommentInput postId={postId} />
      {hasNextPage && (
        <>
          {!isFetchingNextPage ? (
            <Button
              variant="link"
              className="mx-auto block"
              disabled={isFetching}
              onClick={() => fetchNextPage()}
            >
              Load previous comments
            </Button>
          ) : (
            <Loader2 className="mx-auto animate-spin" />
          )}
        </>
      )}
      {status === "pending" ? (
        <Loader2 className="mx-auto animate-spin" />
      ) : status === "error" ? (
        <p className="text-center text-destructive">
          An error occurred while loading comments.
        </p>
      ) : status === "success" && !comments.length ? (
        <p className="p-2 text-center text-muted-foreground">
          No comments yet.
        </p>
      ) : (
        <div className="divide-y divide-border/50">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
