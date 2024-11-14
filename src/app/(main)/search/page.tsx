import TrendsSidebar from "@/components/TrendsSidebar";
import SearchResults from "./SearchResults";

interface PageProps {
  searchParams: Promise<{ keyword: string }>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { keyword } = await searchParams;
  return {
    title: `Search results for "${keyword}"`,
  };
}

export default async function Page({ searchParams }: PageProps) {
  const { keyword } = await searchParams;
  return (
    <>
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="line-clamp-2 break-all text-center text-2xl font-bold">
            Search results for &quot;{keyword}&quot;
          </h1>
        </div>
        <SearchResults keyword={keyword} />
      </div>
      <TrendsSidebar />
    </>
  );
}
