import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFollowerInfo(
  userId: string,
  initialData: FollowerInfo,
) {
  return useQuery({
    queryKey: ["follower-info", userId],
    queryFn: async () =>
      await kyInstance
        .get(`/api/users/${userId}?action=follower-info`)
        .json<FollowerInfo>(),
    initialData,
    staleTime: Infinity, // telling the query to never expire unless manually invalidated or called again
  });
}
