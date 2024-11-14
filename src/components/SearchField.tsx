"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

const SearchField = () => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const keyword = (form.keyword as HTMLInputElement).value.trim();
    if (!keyword) return;
    router.push(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-[300px]"
      // this is a hack to make the form work without javascript
      method="GET"
      action="/search"
    >
      <Input name="keyword" placeholder="Search" className="pe-10 md:h-10" />
      <SearchIcon className="absolute right-3 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground" />
    </form>
  );
};

export default SearchField;
