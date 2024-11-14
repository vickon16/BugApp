import kyInstance from "@/lib/ky";
import { BookmarkInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";

interface BookmarkButtonProps {
  postId: string;
  initialData: BookmarkInfo;
}

export default function BookmarkButton({
  postId,
  initialData,
}: BookmarkButtonProps) {
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["bookmark-info", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance
        .get(`/api/posts/${postId}`, {
          searchParams: { action: "post-bookmarked-info" },
        })
        .json<BookmarkInfo>(),
    initialData,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      kyInstance.post(`/api/posts/${postId}`, {
        searchParams: {
          action: data.isBookmarkedByUser ? "un-bookmark" : "bookmark",
        },
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<BookmarkInfo>(queryKey);

      // we are using "setQueryData" because we are mutating just one post with comments.
      queryClient.setQueryData<BookmarkInfo>(queryKey, () => ({
        isBookmarkedByUser: !previousState?.isBookmarkedByUser,
      }));

      toast.success(`Post ${data.isBookmarkedByUser ? "un" : ""}bookmarked`);
      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    },
  });

  return (
    <button onClick={() => mutate()} className="flex items-center gap-2">
      <Bookmark
        className={cn(
          "size-5",
          data.isBookmarkedByUser && "fill-primary text-primary",
        )}
      />
    </button>
  );
}
