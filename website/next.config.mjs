/** @type {import('next').NextConfig} */

const isAnalyze = process.env.ANALYZE === "true";

/**
 * Base Next.js configuration for the ProdStarterHub website.
 *
 * This site is intended to be:
 *  - Fast & production-ready
 *  - Docs-first (documentation + examples)
 *  - Monorepo-aware (can import from internal packages)
 */
const baseConfig = {
  /* ============================================================
   * Core behavior
   * ========================================================== */
  reactStrictMode: true,
  swcMinify: true,

  // Useful when hosting under a subpath in the future.
  // For now, keep it empty (root).
  basePath: "",

  /* ============================================================
   * Internationalization (i18n)
   *
   * Main docs are in English, but we aim to support multiple
   * languages for key sections over time.
   * ========================================================== */
  i18n: {
    defaultLocale: "en",
    locales: [
      "en", // English (main)
      "es", // Español
      "pt", // Português
      "ru", // Русский
      "fr", // Français
      "de", // Deutsch
      "ar", // العربية
      "hi", // हिन्दी
      "ja", // 日本語
      "zh"  // 简体中文 (generic code)
    ]
  },

  /* ============================================================
   * Images
   * ========================================================== */
  images: {
    // Adjust as needed when you know the exact domains.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com"
      },
      {
        protocol: "https",
        hostname: "img.shields.io"
      }
    ]
  },

  /* ============================================================
   * Monorepo / transpilation
   *
   * This allows the website to import TypeScript/JS code from
   * internal packages (e.g., CLI utilities or shared components).
   * ========================================================== */
  transpilePackages: [
    "@prodstarter/cli",
    "@prodstarter/core"
  ],

  /* ============================================================
   * TypeScript
   * ========================================================== */
  typescript: {
    // Fail production builds if type errors are present
    ignoreBuildErrors: false
  },

  /* ============================================================
   * ESLint
   * ========================================================== */
  eslint: {
    // Fail production builds if lint errors are present
    ignoreDuringBuilds: false
  },

  /* ============================================================
   * Experimental features (tuned for Next 13/14+)
   * ========================================================== */
  experimental: {
    // Prefer the /app router if you use it
    appDir: true,
    // Enable typed routes if you adopt them
    typedRoutes: true,
    // Other experimental flags can be added here as needed
  },

  /* ============================================================
   * Headers – basic security hardening
   * ========================================================== */
  async headers() {
    const securityHeaders = [
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN"
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff"
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin"
      },
      {
        key: "X-XSS-Protection",
        value: "1; mode=block"
      },
      {
        key: "Permissions-Policy",
        // Adjust as needed when you add specific APIs
        value: "geolocation=(), microphone=(), camera=()"
      }
    ];

    return [
      {
        source: "/(.*)",
        headers: securityHeaders
      }
    ];
  },

  /* ============================================================
   * Redirects / Rewrites
   * ========================================================== */
  async redirects() {
    return [
      // Simple example: keep an easy URL for docs
      {
        source: "/docs",
        destination: "/docs/getting-started",
        permanent: false
      }
    ];
  },

  async rewrites() {
    return [
      // Example: in case you later host API proxy routes from the website
      // {
      //   source: "/api/proxy/:path*",
      //   destination: "https://api.your-backend.example.com/:path*"
      // }
    ];
  },

  /* ============================================================
   * Output / performance-related tweaks
   * ========================================================== */
  productionBrowserSourceMaps: false,

  // If you later decide to use standalone output for Docker images:
  // output: "standalone",
};

let nextConfig = baseConfig;

// Optional: enable bundle analyzer when ANALYZE=true
if (isAnalyze) {
  // Using top-level await in ESM config is supported in Node >= 18
  const { default: withBundleAnalyzer } = await import("@next/bundle-analyzer");
  nextConfig = withBundleAnalyzer({
    enabled: true
  })(baseConfig);
}

export default nextConfig;
