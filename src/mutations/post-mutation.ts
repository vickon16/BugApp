import { deletePost, submitPost } from "@/actions/post-actions";
import { useSession } from "@/components/providers/SessionProvider";
import { PostsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

export function useSubmitPostMutation() {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation({
    mutationFn: submitPost,
    onSuccess: async (newData) => {
      if (!!newData.error || !newData.data) return toast.error(newData.error);
      // rather than invalidating the entire query, we add the new post to the cache
      const queryFilter = {
        queryKey: ["post-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("for-you") ||
            // add the new post to the user-feeds in the profile as well
            (query.queryKey.includes("user-feeds") &&
              query.queryKey.includes(user.id))
          );
        },
      } satisfies QueryFilters;

      // first step is to stop any running queries
      await queryClient.cancelQueries(queryFilter);

      // we are using "setQueriesData" because we are mutating many posts in the cache.
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          // since we are working with infinite Query, we need to put the new post at the top
          // this is because we are dealing with a list of pages.
          const firstPage = oldData?.pages[0];
          if (!!firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newData.data, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1), // remove the first page because we already have it
              ],
            };
          }
        },
      );

      // if they make a new post before the first page is loaded, we need to invalidate the query
      // this is a rare case, but it can happen if the user is very fast and submits a post before the first page is loaded
      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        // only invalidate when the predicate is false and there is no state
        predicate: (query) =>
          !!queryFilter.predicate(query) && !query.state.data,
      });
      toast.success("Post created successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to post. Please try again");
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathName = usePathname();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: async (newData) => {
      if (!!newData.error || !newData.data) return toast.error(newData.error);
      const queryFilter: QueryFilters = { queryKey: ["post-feed"] };
      await queryClient.cancelQueries(queryFilter);
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((post) => post.id !== newData.data.id),
            })),
          };
        },
      );

      toast.success("Post deleted successfully");
      if (pathName === `/posts/${newData.data.id}`) {
        router.push(`/users/${newData.data.user.username}`);
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to delete post. Please try again");
    },
  });
}
