import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import million from "million/compiler";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { compression } from "vite-plugin-compression2";
import { chunkSplitPlugin } from "vite-plugin-chunk-split";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isProd = mode === "production";
  const isDev = mode === "development";
  const isAnalyze = process.env.ANALYZE === "true";

  return {
    server: {
      host: "::",
      port: Number(env.VITE_PORT) || 8080,
      strictPort: false,
      hmr: { overlay: true, port: 24678 },
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      cors: false,
    },

    preview: {
      port: Number(env.VITE_PORT) || 4173,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Cache-Control": "no-store",
      },
    },

    build: {
      target: ["chrome109", "firefox115", "safari16", "edge109"],
      minify: "esbuild",
      sourcemap: isDev ? "inline" : false,
      chunkSizeWarningLimit: 400,
      reportCompressedSize: true,
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      modulePreload: { polyfill: false },
      rollupOptions: {
        output: {
          // Granular vendor splitting — keeps initial JS lean
          manualChunks(id: string) {
            if (id.includes("node_modules")) {
              if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/react-router-dom/"))
                return "vendor-react";
              if (id.includes("@tanstack/react-query"))
                return "vendor-query";
              if (id.includes("framer-motion"))
                return "vendor-motion";
              if (id.includes("lucide-react"))
                return "vendor-icons";
              if (id.includes("recharts"))
                return "vendor-charts";
              if (id.includes("@radix-ui"))
                return "vendor-radix";
              if (id.includes("@supabase"))
                return "vendor-supabase";
              if (id.includes("zod") || id.includes("react-hook-form") || id.includes("@hookform"))
                return "vendor-forms";
              if (id.includes("date-fns") || id.includes("react-day-picker"))
                return "vendor-date";
              if (id.includes("embla-carousel") || id.includes("vaul") || id.includes("cmdk") || id.includes("sonner") || id.includes("input-otp"))
                return "vendor-ui-extras";
              return "vendor-misc";
            }
          },
          chunkFileNames: isProd ? "assets/js/[name]-[hash].js" : "assets/js/[name].js",
          entryFileNames: isProd ? "assets/js/[name]-[hash].js" : "assets/js/[name].js",
          assetFileNames: isProd ? "assets/[ext]/[name]-[hash].[ext]" : "assets/[ext]/[name].[ext]",
        },
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
    },

    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@tanstack/react-query",
        "framer-motion",
        "lucide-react",
        "clsx",
        "tailwind-merge",
        "zod",
      ],
      exclude: ["@vite/client", "@vite/env"],
    },

    resolve: {
      alias: {
        "@":            path.resolve(__dirname, "./src"),
        "@/components": path.resolve(__dirname, "./src/components"),
        "@/lib":        path.resolve(__dirname, "./src/lib"),
        "@/pages":      path.resolve(__dirname, "./src/pages"),
        "@/hooks":      path.resolve(__dirname, "./src/hooks"),
        "@/stores":     path.resolve(__dirname, "./src/stores"),
        "@/types":      path.resolve(__dirname, "./src/types"),
        "@/utils":      path.resolve(__dirname, "./src/utils"),
        "@/services":   path.resolve(__dirname, "./src/services"),
        "@/constants":  path.resolve(__dirname, "./src/constants"),
        "@/assets":     path.resolve(__dirname, "./src/assets"),
      },
    },

    css: {
      devSourcemap: isDev,
      modules: {
        localsConvention: "camelCaseOnly",
      },
    },

    plugins: [
      million.vite({ auto: true, mute: true }),
      react(),
      // Brotli + Gzip in production
      isProd && compression({ algorithm: "brotliCompress", exclude: /\.(png|jpg|webp|avif|gif|svg|ico|woff2?)$/, deleteOriginalAssets: false }),
      isProd && compression({ algorithm: "gzip", exclude: /\.(png|jpg|webp|avif|gif|svg|ico|woff2?)$/, deleteOriginalAssets: false }),
      // Smarter chunk splitting
      isProd && chunkSplitPlugin({ strategy: "unbundle" }),
      // Bundle analysis — only when ANALYZE=true
      isAnalyze && visualizer({ open: true, gzipSize: true, brotliSize: true, filename: "dist/stats.html" }),
      // Component tagging in dev for Lovable
      isDev && componentTagger(),
    ].filter(Boolean),

    esbuild: {
      legalComments: "none",
      drop: isProd ? ["console", "debugger"] : [],
      pure: isProd ? ["console.log", "console.info", "console.debug", "console.warn"] : [],
    },

    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __DEV__: isDev,
    },
  };
});
