import kyInstance from "@/lib/ky";
import { NotificationCountInfo, NotificationsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => kyInstance.post("/api/notifications?action=mark-as-read"),
    onSuccess: async () => {
      queryClient.setQueryData<NotificationCountInfo>(
        ["unread-notification-count"],
        { unreadCount: 0 },
      );

      const queryFilter: QueryFilters = { queryKey: ["notifications"] };
      await queryClient.cancelQueries(queryFilter);

      // we are using "setQueriesData" because we are mutating many posts in the cache.
      queryClient.setQueriesData<
        InfiniteData<NotificationsPage, string | null>
      >(queryFilter, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((n) => ({
              ...n,
              read: true,
            })),
          })),
        };
      });
    },
    onError(error) {
      console.error("Failed to mark notifications as read", error);
    },
  });
};
