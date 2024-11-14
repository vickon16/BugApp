import { deleteComment, submitComment } from "@/actions/comment-action";
import { CommentsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export function useSubmitCommentMutation(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitComment,
    onSuccess: async (newComment) => {
      if (!!newComment.error || !newComment.data)
        return toast.error(newComment.error);
      const queryFilters: QueryFilters = { queryKey: ["comments", postId] };

      await queryClient.cancelQueries(queryFilters);

      queryClient.setQueriesData<InfiniteData<CommentsPage, string | null>>(
        queryFilters,
        (oldData) => {
          const firstPage = oldData?.pages[0];

          if (!!firstPage) {
            return {
              ...oldData,
              pages: [
                {
                  previousCursor: firstPage.previousCursor,
                  // we spread the firstPage comments first since we want the new comment to be at the bottom
                  comments: [...firstPage.comments, newComment.data],
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      // if they make a new post before the first page is loaded, we need to invalidate the query
      // this is a rare case, but it can happen if the user is very fast and submits a post before the first page is loaded
      queryClient.invalidateQueries({
        queryKey: queryFilters.queryKey,
        // only invalidate when the predicate is false and there is no state
        predicate: (query) => !query.state.data,
      });
      toast.success("Comment created successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to comment. Please try again");
    },
  });
}

export function useDeleteCommentMutation(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: async (data) => {
      if (!!data?.error || !data?.data) return toast.error(data.error);
      const queryFilters: QueryFilters = { queryKey: ["comments", postId] };

      await queryClient.cancelQueries(queryFilters);

      queryClient.setQueriesData<InfiniteData<CommentsPage, string | null>>(
        queryFilters,
        (oldData) => {
          if (!oldData) return;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              comments: page.comments.filter(
                (comment) => comment.id !== data.data,
              ),
            })),
          };
        },
      );

      toast.success("Comment deleted successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to delete comment. Please try again");
    },
  });
}
