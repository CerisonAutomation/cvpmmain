# Christiano PM - Enterprise Development Guidelines

Welcome to the Christiano PM (CVPM) codebase. This project adheres to high enterprise standards to ensure security, performance, and maintainability.

## 1. Type Safety
- **Strict Typing**: Avoid the use of `any` at all costs. Every object and function parameter should be explicitly typed.
- **Zod Validation**: All data crossing the boundary from external APIs (Guesty, Supabase) MUST be validated using Zod schemas found in `src/lib/guesty/schemas.ts` or `src/lib/types.ts`.
- **Discriminated Unions**: Use discriminated unions for complex state or response objects to ensure exhaustive type checking.

## 2. API Architecture
- **Centralized Client**: All Guesty API calls must go through the `guestyClient` in `src/lib/guesty/client.ts`.
- **Hooks-First**: Use the custom hooks in `src/lib/guesty/hooks.ts` (powered by TanStack Query) for data fetching. This ensures consistent caching, retry logic, and error handling.
- **Boundary Validation**: The API client automatically validates responses. If you add a new endpoint, you must add a corresponding Zod schema.

## 3. Component Standards
- **Performance**: Use `React.memo` for components that are part of large lists (like `PropertyCard`).
- **Accessibility**: All interactive elements must have appropriate ARIA labels. Ensure WCAG 2.1 AA compliance.
- **Loading/Error States**: Every data-driven page must implement consistent loading skeletons (`PropertyCardSkeleton`) and error fallback states (`ErrorState`).

## 4. Security
- **Input Sanitization**: Always sanitize user input using `sanitizeInput` or `sanitizeObject` from `@/lib/utils` before processing or submitting to an API.
- **XSS Protection**: Never use `dangerouslySetInnerHTML` with unsanitized content.
- **CSRF & RLS**: Supabase Row Level Security (RLS) is used to protect database access. Ensure policies are correctly configured for any new tables.

## 5. Testing
- **Unit Tests**: Write unit tests for all business logic, normalizers, and utility functions in `src/test/`.
- **Integration Tests**: Use `@testing-library/react` to test complex hooks and component interactions.
- **Command**: Run `npm run test` to verify your changes.

## 6. Project Structure
- `src/components/ui/`: Low-level Shadcn UI components.
- `src/lib/guesty/`: Guesty API integration layer.
- `src/hooks/`: Custom React hooks.
- `src/pages/`: Main application routes (lazy-loaded).
