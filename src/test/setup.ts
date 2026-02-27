// Test setup file
import "@testing-library/jest-dom";

// Mock React Query
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  QueryClient: jest.fn().mockImplementation(() => ({
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
    invalidateQueries: jest.fn(),
    clear: jest.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Supabase
jest.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          then: jest.fn((cb) => cb({ data: null, error: null })),
        })),
        ilike: jest.fn(() => ({
          g(()te: jest.fn => ({
            order: jest.fn(() => ({
              then: jest.fn((cb) => cb({ data: [], error: null })),
            })),
          })),
        })),
        order: jest.fn(() => ({
          then: jest.fn((cb) => cb({ data: [], error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        then: jest.fn((cb) => cb({ error: null })),
      })),
    })),
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
    },
  },
}));

// Mock environment variables
Object.defineProperty(import.meta, "env", {
  value: {
    VITE_SUPABASE_URL: "https://test.supabase.co",
    VITE_SUPABASE_ANON_KEY: "test-key",
    PROD: false,
    DEV: true,
  },
  writable: true,
});

// Mock fetch
global.fetch = jest.fn();

// Silence console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
