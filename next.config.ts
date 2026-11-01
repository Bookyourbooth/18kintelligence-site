import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Hostinger's build host kills the separate Node processes Turbopack
   * spawns for CSS and loader work ("node process exited before we could
   * connect to it"), which fails the build. Running that work on threads
   * inside the build process avoids it. Same fix as BYBhub, which builds
   * on the same host.
   */
  experimental: {
    turbopackPluginRuntimeStrategy: "workerThreads",
  },
};

export default nextConfig;
