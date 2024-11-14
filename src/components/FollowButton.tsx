"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowButton({
  userId,
  initialState,
}: FollowButtonProps) {
  const queryClient = useQueryClient();
  const { data } = useFollowerInfo(userId, initialState);
  const queryKey: QueryKey = ["follower-info", userId];

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.post(`/api/users/${userId}?action=unfollow`)
        : kyInstance.post(`/api/users/${userId}?action=follow`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      // optimistic update
      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);

      // we are using "setQueryData" because we are mutating just one post with comments.
      queryClient.setQueryData<FollowerInfo>(queryKey, (/* oldState */) => ({
        followers:
          (previousState?.followers || 0) +
          (previousState?.isFollowedByUser ? -1 : 1),
        isFollowedByUser: !previousState?.isFollowedByUser,
      }));
      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast.error(
        `Failed to ${data.isFollowedByUser ? "unfollow" : "follow"} user`,
      );
    },
  });

  return (
    <Button
      variant={data.isFollowedByUser ? "secondary" : "default"}
      onClick={() => mutate()}
      className="h-8"
    >
      {data.isFollowedByUser ? "Unfollow" : "Follow"}
    </Button>
  );
}
