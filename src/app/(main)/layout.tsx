import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";
import SessionProvider from "@/components/providers/SessionProvider";
import { validateRequest } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import MenuBar from "@/components/MenuBar";

export default async function Layout({ children }: PropsWithChildren) {
  const session = await validateRequest();
  if (!session.user) redirect("/login");

  return (
    <SessionProvider value={session}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="mx-auto flex w-full max-w-8xl grow gap-4 p-5">
          <MenuBar className="sticky top-[5.25rem] hidden h-fit flex-col space-y-3 rounded-2xl border bg-card px-2 py-5 shadow-sm sm:flex lg:px-3 xl:w-80" />
          <main className="flex w-full min-w-0 gap-5">{children}</main>
        </div>
        <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
      </div>
    </SessionProvider>
  );
}
