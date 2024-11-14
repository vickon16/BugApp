import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex size-full min-h-screen flex-1 items-center justify-center">
      <Loader2 className="mx-auto my-3 animate-spin" />
    </div>
  );
}
