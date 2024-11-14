"use client";

import useInitializedChatClient from "@/hooks/useInitializedChatClient";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Chat as StreamChat } from "stream-chat-react";
import ChatSidebar from "./ChatSidebar";
import { useState } from "react";
import ChatChannel from "./ChatChannel";
import "stream-chat-react/dist/css/v2/index.css";

const Chat = () => {
  const chatClient = useInitializedChatClient();
  const { resolvedTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!chatClient) {
    return <Loader2 className="mx-auto my-3 animate-spin" />;
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/30 bg-card shadow-sm">
      <div className="absolute bottom-0 top-0 flex w-full">
        <StreamChat
          client={chatClient}
          theme={
            resolvedTheme === "dark"
              ? "str-chat__theme-dark"
              : "str-chat__theme-light"
          }
        >
          <ChatSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <ChatChannel
            open={!sidebarOpen}
            openSidebar={() => setSidebarOpen(true)}
          />
        </StreamChat>
      </div>
    </div>
  );
};

export default Chat;
