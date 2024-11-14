import { Loader2, SendHorizonal } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { useSubmitCommentMutation } from "@/hooks/useCommentMutation";

interface CommentInputProps {
  postId: string;
}

export default function CommentInput({ postId }: CommentInputProps) {
  const [input, setInput] = useState("");
  const mutation = useSubmitCommentMutation(postId);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input || !postId) return;

    mutation.mutate(
      { postId, content: input },
      { onSuccess: () => setInput("") },
    );
  }

  return (
    <form className="flex w-full items-center gap-2" onSubmit={onSubmit}>
      <Input
        placeholder="Write a comment..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
        className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
      />
      <button
        type="submit"
        disabled={!input.trim() || mutation.isPending}
        className="cursor-pointer p-2 disabled:text-muted"
      >
        {!mutation.isPending ? (
          <SendHorizonal size={24} />
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </button>
    </form>
  );
}
