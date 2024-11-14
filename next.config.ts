import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // experimental: {
  //   staleTimes: { dynamic: 30}
  // },
  serverExternalPackages: ["@node-rs/argon2"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        // whitelisting the URL for security reasons instead of using a wildcard
        pathname: `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/*`,
      },
    ],
  },
  rewrites: async () => {
    return [
      // I want to keep the page of /search?keyword=tag, so I have to redirect any /hashtag/:tag to /search
      { source: "/hashtag/:tag", destination: "/search?keyword=%23:tag" },
    ];
  },
};

export default nextConfig;
