import TrendsSidebar from "@/components/TrendsSidebar";
import { Metadata } from "next";
import Feeds from "@/components/Feeds";

export const metadata: Metadata = {
  title: "Bookmarks",
};

export default function Page() {
  return (
    <>
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold">Bookmarks</h1>
        </div>
        <Feeds type="bookmarks" />
      </div>
      <TrendsSidebar />
    </>
  );
}
