import { useSession } from "@/components/providers/SessionProvider";
import kyInstance from "@/lib/ky";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

export default function useInitializedChatClient() {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const { user } = useSession();

  useEffect(() => {
    if (!user) return;
    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

    client
      .connectUser(
        {
          id: user.id,
          username: user.username,
          name: user.displayName,
          image: user.avatarUrl,
        },
        async () =>
          kyInstance
            .get("/api/get-token")
            .json<{ token: string }>()
            .then((data) => data.token),
      )
      .catch((error) => console.log("Failed to connect user", error))
      .then(() => setChatClient(client));

    return () => {
      // clean up
      setChatClient(null);
      client
        .disconnectUser()
        .catch((error) => console.log("Failed to disconnectUser", error))
        .then(() => console.log("Connection Closed"));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.username, user.displayName, user.avatarUrl]);

  return chatClient;
}
