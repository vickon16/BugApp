import { PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import ReactQueryProvider from "./ReactQueryProvider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { fileRouter } from "@/app/api/uploadthing/core";

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <>
      <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
      <ReactQueryProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          {children}
        </ThemeProvider>
      </ReactQueryProvider>
    </>
  );
};

export default Providers;
