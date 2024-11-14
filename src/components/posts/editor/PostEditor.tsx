"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import UserAvatar from "@/components/UserAvatar";
import { useSession } from "@/components/providers/SessionProvider";
import { cn } from "@/lib/utils";
import LoadingButton from "@/components/LoadingButton";
import "./styles.css";
import { useSubmitPostMutation } from "@/mutations/post-mutation";
import useMediaUpload, { TMedia } from "@/hooks/useMediaUpload";
import { ClipboardEvent, useMemo, useRef } from "react";
import { Paperclip, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useDropzone } from "@uploadthing/react";

const PostEditor = () => {
  const { user } = useSession();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // disable text styling
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "What's happening?",
      }),
    ],
    immediatelyRender: false,
  });
  const mutation = useSubmitPostMutation();
  const {
    startUpload,
    medias,
    isUploading,
    uploadProgress,
    removeMedia,
    resetMediaUploads,
  } = useMediaUpload();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: startUpload,
  });

  // ignore onClick, so that we don't trigger a file input when we click on the root element
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { onClick, ...rootProps } = getRootProps();

  const input = editor?.getText({ blockSeparator: "\n" }) || "";

  const onSubmit = async () => {
    mutation.mutate(
      {
        content: input,
        mediaIds: medias.map((m) => m.mediaId).filter(Boolean) as string[],
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          resetMediaUploads();
        },
      },
    );
  };

  function onPaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const files = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[];

    startUpload(files);
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <div className="w-full" {...rootProps}>
          <EditorContent
            editor={editor}
            className={cn(
              "max-h-[20rem] w-full overflow-y-auto bg-background px-5 py-3",
              isDragActive && "outline-dashed",
            )}
            onPaste={onPaste}
          />
          <input {...getInputProps()} />
        </div>
      </div>
      {!!medias.length && (
        <MediaPreviews medias={medias} removeMedia={removeMedia} />
      )}
      <div className="flex items-center justify-end gap-3">
        {isUploading && (
          <>
            <span className="text-sm">{uploadProgress ?? 0}%</span>
            <Loader2 className="size-5 animate-spin text-primary" />
          </>
        )}
        <AddMediasButton
          onFilesSelected={startUpload}
          disabled={isUploading || medias.length >= 5}
        />
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!input.trim() || isUploading}
          className="min-w-20"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
};

export default PostEditor;

interface AddMediasButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

function AddMediasButton({ onFilesSelected, disabled }: AddMediasButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        className="text-primary/80 transition-colors hover:text-primary"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <Paperclip size={25} />
      </button>
      <input
        type="file"
        accept="image/*, video/*"
        multiple
        ref={fileInputRef}
        className="sr-only hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (!!files.length) {
            onFilesSelected(files);
            e.target.value = "";
          }
        }}
      />
    </>
  );
}

interface MediaPreviewsProps {
  medias: TMedia[];
  removeMedia: (fileName: string) => void;
}

function MediaPreviews({ medias, removeMedia }: MediaPreviewsProps) {
  const mediaUrls = useMemo(
    () =>
      medias.map((m) => ({
        ...m,
        src: URL.createObjectURL(m.file),
      })),
    [medias],
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        medias.length > 1 && "sm:grid sm:grid-cols-2 md:grid-cols-3",
      )}
    >
      {mediaUrls.map((media) => {
        return (
          <div
            key={media.file.name}
            className={cn(
              "relative mx-auto size-full",
              media.isUploading && "opacity-50",
            )}
          >
            {media.file.type.startsWith("image") ? (
              <Image
                src={media.src}
                alt="Media preview"
                width={300}
                height={300}
                className="size-full max-h-[18rem]"
              />
            ) : (
              <video controls className="size-full max-h-[18rem]">
                <source src={media.src} type={media.file.type} />
              </video>
            )}
            {!media.isUploading && (
              <button
                onClick={() => removeMedia(media.file.name)}
                className="absolute right-3 top-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60"
              >
                <X size={20} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
