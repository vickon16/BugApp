import Feeds from "@/components/Feeds";
import PostEditor from "@/components/posts/editor/PostEditor";
import TrendsSidebar from "@/components/TrendsSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Home() {
  return (
    <>
      <div className="w-full min-w-0 flex-1 space-y-4">
        <PostEditor />
        <Tabs defaultValue="for-you">
          <TabsList>
            <TabsTrigger value="for-you">For you</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          <TabsContent value="for-you">
            <Feeds type="for-you" />
          </TabsContent>
          <TabsContent value="following">
            <Feeds type="following" />
          </TabsContent>
        </Tabs>
      </div>
      <TrendsSidebar />
    </>
  );
}
