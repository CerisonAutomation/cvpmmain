// Test setup file
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables — keys must match envSchema in src/lib/env.ts
vi.stubGlobal("import.meta", {
  env: {
    VITE_SUPABASE_URL: "https://test.supabase.co",
    VITE_SUPABASE_ANON_KEY: "test-anon-key",
    VITE_GUESTY_FN_URL: undefined,
    VITE_STRIPE_PUBLISHABLE_KEY: undefined,
    VITE_LEAD_WEBHOOK_URL: undefined,
    VITE_APP_URL: undefined,
    PROD: false,
    DEV: true,
    MODE: "test",
  },
});

// Mock fetch globally
vi.stubGlobal("fetch", vi.fn());
