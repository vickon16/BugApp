import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import { SourGummy } from "@/lib/customFonts";

export const metadata: Metadata = {
  title: {
    template: "%s - BugApp",
    default: "BugApp",
  },
  description: "The social media app for power nerds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${SourGummy.variable} ${SourGummy.className} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
