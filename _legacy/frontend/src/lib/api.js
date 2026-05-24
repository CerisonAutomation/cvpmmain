/** Shared API base — empty VITE_BACKEND_URL = same-origin /api on Vercel */
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? '';
export const API = `${BACKEND_URL}/api`;
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '';
