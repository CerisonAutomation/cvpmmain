// Test setup file
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables
vi.stubGlobal("import.meta", {
  env: {
    VITE_SUPABASE_URL: "https://test.supabase.co",
    VITE_SUPABASE_PUBLISHABLE_KEY: "test-key",
    PROD: false,
    DEV: true,
    MODE: "test",
  },
});

// Mock fetch
vi.stubGlobal("fetch", vi.fn());
