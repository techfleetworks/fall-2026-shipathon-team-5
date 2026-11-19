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
      { source: "/check-before-you-believe", destination: "/use-veritas", permanent: true },
      { source: "/check-before-you-believe/:path*", destination: "/use-veritas", permanent: true },
      // The Tools to double-check section was split up: Veritas got its own page, and the
      // reverse image search guide moved to Learn. Old links (and the extension) still work.
      { source: "/tools-to-double-check", destination: "/use-veritas", permanent: true },
      { source: "/tools-to-double-check/using-veritas", destination: "/use-veritas", permanent: true },
      { source: "/tools-to-double-check/reverse-image-search", destination: "/spot-the-slop/reverse-image-search", permanent: true },
      { source: "/tools-to-double-check/:path*", destination: "/use-veritas", permanent: true },
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
