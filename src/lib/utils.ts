import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize string input to prevent XSS.
 * Removes <script> tags and common event handlers.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/\s*on\w+="[^"]*"/gim, "")
    .replace(/\s*on\w+='[^']*'/gim, "")
    .replace(/javascript:[^"']*/gim, "")
    .trim();
}

/**
 * Deeply sanitize an object or array of inputs.
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeInput(obj) as unknown as T;
  if (Array.isArray(obj)) return obj.map(sanitizeObject) as unknown as T;
  if (typeof obj === 'object') {
    const result = {} as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = sanitizeObject((obj as Record<string, unknown>)[key]);
      }
    }
    return result as T;
  }
  return obj;
}
