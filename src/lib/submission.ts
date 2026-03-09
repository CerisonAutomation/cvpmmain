/**
 * Lead Submission & Wizard Logic
 * Enterprise-grade lead capture with validation and webhook delivery
 */
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

export const wizardSchema = z.object({
  status: z.enum(['not_listed', 'already_listed', 'switching']),
  listingUrl: z.string().url().optional().or(z.literal('')),
  currentManager: z.string().max(100).optional(),
  locality: z.string().min(1, 'Locality is required').max(100),
  propertyType: z.string().min(1, 'Property type is required'),
  bedrooms: z.string().min(1, 'Bedrooms required'),
  sleeps: z.string().optional(),
  timeline: z.string().min(1, 'Timeline is required'),
  goal: z.string().min(1, 'Goal is required'),
  handsOff: z.boolean(),
  licenceReady: z.boolean(),
  upgradeBudget: z.string().optional(),
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Valid email is required').max(255),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,20}$/, 'Valid phone number required'),
  preferredContact: z.enum(['whatsapp', 'email', 'phone']),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required' }) }),
});

export interface WizardData {
  status: '' | 'not_listed' | 'already_listed' | 'switching';
  listingUrl?: string;
  currentManager?: string;
  locality: string;
  propertyType: string;
  bedrooms: string;
  sleeps: string;
  timeline: string;
  goal: string;
  handsOff: boolean;
  licenceReady: boolean;
  upgradeBudget: string;
  name: string;
  email: string;
  phone: string;
  preferredContact: string;
  consent: boolean;
}

export const INITIAL_WIZARD_DATA: WizardData = {
  status: '',
  locality: '',
  propertyType: '',
  bedrooms: '',
  sleeps: '',
  timeline: '',
  goal: '',
  handsOff: false,
  licenceReady: false,
  upgradeBudget: '',
  name: '',
  email: '',
  phone: '',
  preferredContact: 'whatsapp',
  consent: false,
};

const DRAFT_KEY = 'cv_wizard_draft';

export function saveDraft(data: WizardData) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch {}
}

export function loadDraft(): WizardData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}

export function computeTier(data: WizardData): string {
  if (data.timeline === 'asap' && data.handsOff) return 'A';
  if (data.timeline === 'exploring') return 'C';
  return 'B';
}

export function computePlan(data: WizardData): string {
  return data.handsOff ? 'Complete' : 'Essentials';
}

/**
 * Submit lead to backend
 * Uses edge function endpoint or falls back to mailto
 */
export async function submitLead(data: WizardData): Promise<{ success: boolean; error?: string }> {
  // Validate data
  const validation = wizardSchema.safeParse(data);
  if (!validation.success) {
    console.error('Validation failed:', validation.error.flatten());
    return { success: false, error: 'Validation failed' };
  }

  const payload = {
    ...data,
    tier: computeTier(data),
    plan: computePlan(data),
    source: 'wizard',
    timestamp: new Date().toISOString(),
  };

  try {
    // Try edge function first
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && anonKey) {
      const response = await fetch(`${supabaseUrl}/functions/v1/create-pending`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('Lead submitted successfully via edge function');
        return { success: true };
      }

      console.warn('Edge function failed, falling back to mailto');
    }

    // Fallback: open mailto
    openMailto(data);
    return { success: true };
  } catch (err) {
    console.error('Lead submission error:', err);
    // Still open mailto as ultimate fallback
    openMailto(data);
    return { success: true };
  }
}

function openMailto(data: WizardData) {
  const subject = encodeURIComponent(`New Lead: ${data.name} - ${data.locality}`);
  const body = encodeURIComponent(`
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Preferred Contact: ${data.preferredContact}

Property:
- Locality: ${data.locality}
- Type: ${data.propertyType}
- Bedrooms: ${data.bedrooms}
- Sleeps: ${data.sleeps || 'N/A'}

Status: ${data.status}
Timeline: ${data.timeline}
Goal: ${data.goal}
Hands-off: ${data.handsOff ? 'Yes' : 'No'}
MTA Licence Ready: ${data.licenceReady ? 'Yes' : 'No'}
Upgrade Budget: ${data.upgradeBudget || 'N/A'}

Tier: ${computeTier(data)}
Recommended Plan: ${computePlan(data)}
  `.trim());

  window.location.href = `mailto:info@christianopropertymanagement.com?subject=${subject}&body=${body}`;
}
