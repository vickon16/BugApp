import { MAX_FILE_UPLOAD } from "@/lib/constants";
import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";
import { toast } from "sonner";

export interface TMedia {
  file: File;
  mediaId?: string;
  isUploading: boolean;
}

export default function useMediaUpload() {
  const [medias, setMedias] = useState<TMedia[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>();
  const { startUpload, isUploading } = useUploadThing("media", {
    // we don't have the mediaId at this point.
    onBeforeUploadBegin(files) {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".").pop();
        // rename for easy Identification
        const newFileName = `media_${crypto.randomUUID()}.${extension}`;
        return new File([file], newFileName, {
          type: file.type,
        });
      });

      setMedias((prev) => [
        ...prev,
        ...renamedFiles.map((file) => ({
          file,
          mediaId: undefined,
          isUploading: true,
        })),
      ]);
      return renamedFiles;
    },
    onUploadProgress: setUploadProgress,
    onClientUploadComplete(res) {
      // the response gotten back is the "mediaId" of the uploadedFile
      setMedias((prev) =>
        prev.map((a) => {
          // check if the new Uploaded file is the same as the one we are uploading
          const uploadedResult = res.find((r) => r.name === a.file.name);
          if (!uploadedResult) return a;
          return {
            ...a,
            mediaId: uploadedResult.serverData.mediaId,
            isUploading: false,
          };
        }),
      );
    },
    onUploadError(e) {
      // if there is an error, we should remove the uploads that is still uploading
      // i.e remove the uploads that the "isUploading" is true
      setMedias((prev) => prev.filter((a) => !a.isUploading));
      toast.error("Failed to upload media(s)" + e.message);
    },
  });

  function handleStartUpload(files: File[]) {
    // this is so that we can handle one upload at a time.
    if (isUploading)
      return toast.error("Please wait for the current upload to finish");

    // this is a safety check to prevent users from uploading more than the maximum allowed
    if (medias.length + files.length > MAX_FILE_UPLOAD) {
      return toast.error(
        `You can only upload up to ${MAX_FILE_UPLOAD} media per post`,
      );
    }

    startUpload(files);
  }

  function removeMedia(fileName: string) {
    setMedias((prev) => prev.filter((a) => a.file.name !== fileName));
  }

  function resetMediaUploads() {
    setMedias([]);
    setUploadProgress(undefined);
  }

  return {
    startUpload: handleStartUpload,
    medias,
    isUploading,
    uploadProgress,
    removeMedia,
    resetMediaUploads,
  };
}
