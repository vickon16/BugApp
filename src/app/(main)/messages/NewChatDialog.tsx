"use client";
import LoadingButton from "@/components/LoadingButton";
import { useSession } from "@/components/providers/SessionProvider";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserAvatar from "@/components/UserAvatar";
import useDebounce from "@/hooks/useDebounce";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Loader2, SearchIcon, X } from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";
import { UserResponse } from "stream-chat";
import { DefaultStreamChatGenerics, useChatContext } from "stream-chat-react";

interface NewChatDialogProps {
  onOpenChange: (open: boolean) => void;
  onChatCreated: () => void;
}

export default function NewChatDialog({
  onOpenChange,
  onChatCreated,
}: NewChatDialogProps) {
  const { client, setActiveChannel } = useChatContext();
  const { user: loggedInUser } = useSession();
  const [searchInput, setSearchInput] = useState("");
  const searchInputDebounced = useDebounce(searchInput);
  const [selectedUsers, setSelectedUsers] = useState<
    UserResponse<DefaultStreamChatGenerics>[]
  >([]);

  const { data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["stream-users", searchInputDebounced],
    queryFn: async () =>
      client.queryUsers(
        {
          // fetch users that are not equal to the logged in user
          id: { $ne: loggedInUser.id },
          // fetch users that are not admins
          role: { $ne: "admin" },
          ...(searchInputDebounced
            ? {
                // now find users that their name or username contains the search input
                $or: [
                  { name: { $autocomplete: searchInputDebounced } },
                  { username: { $autocomplete: searchInputDebounced } },
                ],
              }
            : {}),
        },
        // sort order, by name first and username second
        { name: 1, username: 1 },
        { limit: 15 },
      ),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const channel = client.channel("messaging", {
        members: [loggedInUser.id, ...selectedUsers.map((u) => u.id)],
        name:
          selectedUsers.length > 1
            ? loggedInUser.displayName +
              ", " +
              selectedUsers.map((u) => u.name).join(", ")
            : undefined,
      });

      await channel.create();
      return channel;
    },
    onSuccess: (channel) => {
      setActiveChannel(channel);
      onChatCreated();
    },
    onError(error) {
      console.error("Error starting chat", error);
      toast.error("Error starting chat. Please try again.");
    },
  });

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="border bg-card p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>New chat</DialogTitle>
        </DialogHeader>
        <div>
          <div className="group relative">
            <SearchIcon className="absolute left-5 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground group-focus-within:text-primary" />
            <input
              placeholder="Search users..."
              className="h-12 w-full pe-4 ps-14 focus:outline-none"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          {!!selectedUsers.length && (
            <div className="mt-4 flex flex-wrap gap-2 p-2">
              {selectedUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setSelectedUsers((prev) =>
                      prev.filter((u) => u.id !== user.id),
                    );
                  }}
                  className="flex items-center gap-2 rounded-full border p-1 hover:bg-muted/50"
                >
                  <UserAvatar avatarUrl={user.image} size={20} />
                  <p className="text-xs">{user.name}</p>
                  <X className="mx-2 size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}

          <hr />
          <div className="mt-6 h-full max-h-96 overflow-y-auto">
            {isFetching ? (
              <Loader2 className="mx-auto my-3 animate-spin" />
            ) : isError ? (
              <p className="my-3 text-center text-destructive">
                An error occurred while loading users.
              </p>
            ) : isSuccess && !data.users.length ? (
              <p className="my-3 text-center text-muted-foreground">
                No users found. Try a different name.
              </p>
            ) : (
              isSuccess &&
              data.users.map((user) => {
                const selected = selectedUsers.some((u) => u.id === user.id);
                return (
                  <button
                    key={user.id}
                    className="flex w-full items-center justify-between px-4 py-2 transition-colors hover:bg-muted/50"
                    onClick={() => {
                      setSelectedUsers((prev) =>
                        prev.some((u) => u.id === user.id)
                          ? prev.filter((u) => u.id !== user.id)
                          : [...prev, user],
                      );
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <UserAvatar avatarUrl={user.image} size={30} />
                      <div className="flex flex-col text-start">
                        <p className="text-sm font-bold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    {selected && <Check className="size-5 text-green-500" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <LoadingButton
            disabled={!selectedUsers.length}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Start chat
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
