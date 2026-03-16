import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", "e2e", "tests"],
    reporters: ["verbose", "html"],
    outputFile: { html: "./test-results/index.html" },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "json-summary", "html", "lcov"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/**",
        "src/test/**",
        "src/**/*.d.ts",
        "src/**/*.config.*",
        "src/main.tsx",
        "src/vite-env.d.ts",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    pool: "forks",
    poolOptions: { forks: { singleFork: false } },
    retry: 1,
    maxConcurrency: 10,
    typecheck: {
      tsconfig: "./tsconfig.app.json",
    },
  },
  resolve: {
    alias: {
      "@":            path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib":        path.resolve(__dirname, "./src/lib"),
      "@/hooks":      path.resolve(__dirname, "./src/hooks"),
      "@/utils":      path.resolve(__dirname, "./src/utils"),
      "@/types":      path.resolve(__dirname, "./src/types"),
      "@/services":   path.resolve(__dirname, "./src/services"),
      "@/constants":  path.resolve(__dirname, "./src/constants"),
    },
  },
});
