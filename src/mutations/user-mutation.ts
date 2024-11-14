import { updateUserProfile } from "@/actions/user-actions";
import { PostsPage, ProfileMutationPayload } from "@/lib/types";
import { useUploadThing } from "@/lib/uploadthing";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useUpdateProfileMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { startUpload: startAvatarUpload } = useUploadThing("avatar");

  return useMutation({
    mutationFn: async ({ values, avatar }: ProfileMutationPayload) => {
      return Promise.all([
        updateUserProfile(values),
        !!avatar && startAvatarUpload([avatar]),
      ]);
    },
    onSuccess: async ([updatedUser, uploadedResult]) => {
      if (!!updatedUser.error || !updatedUser.data)
        return toast.error(updatedUser.error || "Failed to update profile");

      const newAvatarUrl =
        !!uploadedResult && !!uploadedResult.length
          ? uploadedResult[0].serverData.avatarUrl
          : undefined;

      const queryFilter = {
        queryKey: ["post-feed"],
      } satisfies QueryFilters;

      await queryClient.cancelQueries(queryFilter);

      // we are using "setQueriesData" because we are mutating many posts in the cache.
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) => {
                if (post.userId === updatedUser.data.id) {
                  return {
                    ...post,
                    user: {
                      ...updatedUser.data,
                      avatarUrl: newAvatarUrl || post.user.avatarUrl,
                    },
                  };
                }
                return post;
              }),
            })),
          };
        },
      );

      router.refresh();
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to update profile. Please try again");
    },
  });
}
