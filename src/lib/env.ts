import { z } from 'zod';

/**
 * Environment variable schema
 * Ensures all required variables are present and correctly formatted
 */
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_GUESTY_FN_URL: z.string().url().optional(),
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  DEV: z.boolean().default(false),
  PROD: z.boolean().default(false),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validate and export environment variables
 */
function getEnv(): EnvConfig {
  const env = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_GUESTY_FN_URL: import.meta.env.VITE_GUESTY_FN_URL,
    VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errorMsg = result.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join('\n');

    console.error('❌ Invalid environment variables:\n', errorMsg);

    if (import.meta.env.PROD) {
      // In production, we might want to throw or show a catastrophic error UI
      throw new Error(`Environment validation failed:\n${errorMsg}`);
    }

    return env as unknown as EnvConfig;
  }

  return result.data;
}

export const config = getEnv();

/**
 * Initialize environment validation on app startup
 */
export function initEnvValidation() {
  try {
    const validated = envSchema.parse({
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_GUESTY_FN_URL: import.meta.env.VITE_GUESTY_FN_URL,
      VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    });
    return { valid: true, errors: [], warnings: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return { valid: false, errors, warnings: [] };
    }
    return { valid: false, errors: ['Unknown validation error'], warnings: [] };
  }
}
