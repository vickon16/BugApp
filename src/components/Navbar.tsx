import Link from "next/link";
import UserButton from "./UserButton";
import SearchField from "./SearchField";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-b-border/10 bg-popover shadow-sm">
      <div className="mx-auto flex max-w-8xl flex-wrap items-center justify-center gap-5 px-5 py-3">
        <Link href="/" className="text-2xl font-bold text-primary">
          BugApp
        </Link>
        <SearchField />
        <UserButton className="sm:ml-auto" />
      </div>
    </header>
  );
}
