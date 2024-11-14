import kyInstance from "@/lib/ky";
import { LikeInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface LikeButtonProps {
  postId: string;
  initialData: LikeInfo;
}

export default function LikeButton({ postId, initialData }: LikeButtonProps) {
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["like-info", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance
        .get(`/api/posts/${postId}`, {
          searchParams: { action: "post-liked-info" },
        })
        .json<LikeInfo>(),
    initialData,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: () =>
      kyInstance.post(`/api/posts/${postId}`, {
        searchParams: {
          action: data.isLikedByUser ? "dislike" : "like",
        },
      }),
    onMutate: async () => {
      // like optimistic update
      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<LikeInfo>(queryKey);

      // we are using "setQueryData" because we are mutating just one post with comments.
      queryClient.setQueryData<LikeInfo>(queryKey, () => ({
        likes:
          (previousState?.likes || 0) + (previousState?.isLikedByUser ? -1 : 1),
        isLikedByUser: !previousState?.isLikedByUser,
      }));

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
      <Heart
        className={cn(
          "size-5",
          data.isLikedByUser && "fill-red-500 text-red-500",
        )}
      />
      <span className="text-sm font-medium tabular-nums">
        {data.likes} <span className="hidden sm:inline">likes</span>
      </span>
    </button>
  );
}
