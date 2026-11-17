import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      { source: "/check-before-you-believe", destination: "/tools-to-double-check", permanent: true },
      { source: "/check-before-you-believe/:path*", destination: "/tools-to-double-check/:path*", permanent: true },
      { source: "/skill-check", destination: "/quiz-your-skills", permanent: true },
      { source: "/skill-check/:path*", destination: "/quiz-your-skills", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
