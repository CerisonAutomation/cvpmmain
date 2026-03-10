// Environment validation - Enterprise production check
// Validates required environment variables at startup

interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_GUESTY_FN_URL?: string;
  VITE_STRIPE_PUBLISHABLE_KEY?: string;
}

// Stripe publishable key — needed for checkout
export const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate environment configuration
 */
export function validateEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Validate required vars
  if (!supabaseUrl) {
    errors.push("VITE_SUPABASE_URL is required");
  } else if (!supabaseUrl.startsWith("https://")) {
    errors.push("VITE_SUPABASE_URL must use HTTPS");
  }

  if (!supabaseKey) {
    errors.push("VITE_SUPABASE_ANON_KEY is required");
  }

  // Warnings for optional vars
  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    warnings.push("VITE_STRIPE_PUBLISHABLE_KEY not set - payments disabled");
  }

  if (!import.meta.env.VITE_GUESTY_FN_URL) {
    warnings.push("VITE_GUESTY_FN_URL not set - Guesty sync disabled");
  }

  // Validate production settings
  if (import.meta.env.PROD) {
    if (supabaseUrl?.includes("localhost")) {
      errors.push("Cannot use localhost in production");
    }

    if (supabaseUrl?.includes("supabase.co/instadt")) {
      warnings.push("Using localhost tunnel in production");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get environment info for debugging (safe to log)
 */
export function getEnvInfo() {
  const env = import.meta.env;
  
  return {
    mode: env.MODE,
    dev: env.DEV,
    prod: env.PROD,
    hasSupabase: !!env.VITE_SUPABASE_URL,
    hasStripe: !!env.VITE_STRIPE_PUBLISHABLE_KEY,
    hasGuesty: !!env.VITE_GUESTY_FN_URL,
    // Don't expose actual values
  };
}

/**
 * Initialize environment validation on app startup
 */
export function initEnvValidation() {
  const result = validateEnv();

  if (!result.valid) {
    console.error("Environment validation failed:", result.errors);
    
    // In production, show error page
    if (import.meta.env.PROD) {
      document.body.innerHTML = `
        <div style="padding: 2rem; font-family: system-ui; text-align: center;">
          <h1>Configuration Error</h1>
          <p>There is a problem with the application configuration.</p>
          <pre style="text-align: left; background: #f5f5f5; padding: 1rem; overflow: auto;">
${result.errors.join("\n")}
          </pre>
        </div>
      `;
    }
  }

  if (result.warnings.length > 0) {
    console.warn("Environment warnings:", result.warnings);
  }

  return result;
}

// Export config for use in app
export const config: EnvConfig = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "",
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  VITE_GUESTY_FN_URL: import.meta.env.VITE_GUESTY_FN_URL,
  VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
};
