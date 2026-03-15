import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import million from "million/compiler";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), "");

  return {
    // Enterprise server configuration
    server: {
      host: "::",
      port: Number(env.VITE_PORT) || 8080,
      hmr: {
        overlay: false,
        port: 24678,
      },
      // Security headers
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    },

    // Production optimization
    build: {
      // Target modern browsers for smaller bundles
      target: "esnext",
      // Minify with esbuild for speed
      minify: "esbuild",
      // Generate source maps for debugging (conditional)
      sourcemap: mode === "development",
      // Chunk size warning limit
      chunkSizeWarningLimit: 500,
      // Rollup manual chunks for better code splitting
      rollupOptions: {
        output: {
          // Manual chunking for vendor libraries
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-ui": [
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-tooltip",
              "@radix-ui/react-popover",
            ],
            "vendor-query": ["@tanstack/react-query"],
            "vendor-motion": ["framer-motion"],
            "vendor-icons": ["lucide-react"],
            "vendor-charts": ["recharts"],
          },
        },
      },
      // CSS code splitting
      cssCodeSplit: true,
      // Module preload
      modulePreload: {
        polyfill: false,
      },
    },

    // Optimize dependencies
    optimizeDeps: {
      force: true,
    },

    // Resolve aliases
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Alias for cleaner imports
        "@/components": path.resolve(__dirname, "./src/components"),
        "@/lib": path.resolve(__dirname, "./src/lib"),
        "@/pages": path.resolve(__dirname, "./src/pages"),
        "@/hooks": path.resolve(__dirname, "./src/hooks"),
      },
    },

    // CSS configuration
    css: {
      devSourcemap: mode === "development",
    },

    // Preview configuration
    preview: {
      port: Number(env.VITE_PORT) || 4173,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    },

    // Plugins
    plugins: [
      million.vite({ auto: true }),
      react(),
      // Component tagging in development
      mode === "development" && componentTagger(),
    ].filter(Boolean),

    // Test configuration
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      exclude: ["node_modules", "dist"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        exclude: [
          "node_modules/",
          "src/test/",
          "**/*.d.ts",
          "**/*.config.*",
        ],
      },
    },
  };
});
