import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteCommentMutation } from "@/hooks/useCommentMutation";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import LoadingButton from "../LoadingButton";
import { Button } from "../ui/button";

interface CommentMoreButtonProps {
  postId: string;
  commentId: string;
  className?: string;
}

export default function CommentMoreButton({
  postId,
  commentId,
  className,
}: CommentMoreButtonProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const mutation = useDeleteCommentMutation(postId);

  function handleOpenChange(open: boolean) {
    if (!!open || !mutation.isPending) {
      setShowDeleteDialog(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className={className}>
            <MoreHorizontal className="size-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <span className="flex items-center gap-3 text-destructive">
              <Trash2 className="size-4" />
              Delete
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showDeleteDialog} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete comment?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <LoadingButton
              variant="destructive"
              onClick={() =>
                mutation.mutate(commentId, {
                  onSuccess: () => setShowDeleteDialog(false),
                })
              }
              loading={mutation.isPending}
            >
              Delete
            </LoadingButton>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
