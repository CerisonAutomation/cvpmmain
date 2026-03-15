/**
 * Lead Submission & Wizard Logic
 * Enterprise-grade lead capture with validation and Supabase persistence
 */
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { config } from './env';

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

export const leadModalSchema = z.object({
  intent: z.enum(['owner', 'guest']),
  situation: z.string().min(1),
  goal: z.string().optional(),
  name: z.string().trim().min(2, 'Full name required').max(100),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,20}$/, 'Valid phone number required'),
  email: z.string().trim().email('Valid email required').max(255),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required' }) }),
  source: z.string().default('lead_modal'),
});

export type LeadModalPayload = z.infer<typeof leadModalSchema>;

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
 * Submit wizard lead.
 * 1. Zod validation
 * 2. Supabase DB insert (primary — never lost, queryable, auditable)
 * 3. Edge function notification (secondary — for CRM/email triggers)
 * 4. Mailto fallback (last resort only)
 */
export async function submitLead(data: WizardData): Promise<{ success: boolean; error?: string }> {
  const validation = wizardSchema.safeParse(data);
  if (!validation.success) {
    const msg = validation.error.errors.map(e => e.message).join(', ');
    console.error('[submitLead] Validation failed:', validation.error.flatten());
    return { success: false, error: msg };
  }

  const payload = {
    ...data,
    tier: computeTier(data),
    plan: computePlan(data),
    source: 'wizard' as const,
    submitted_at: new Date().toISOString(),
  };

  // PRIMARY: Supabase insert — always attempt first
  try {
    const { error: dbError } = await supabase
      .from('leads')
      .insert({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        source: payload.source,
        meta: payload,
        submitted_at: payload.submitted_at,
      });

    if (dbError) {
      console.error('[submitLead] Supabase insert error:', dbError);
      // Fall through to edge function
    } else {
      // SECONDARY: Edge function for CRM/email trigger (fire-and-forget, non-blocking)
      const supabaseUrl = config.VITE_SUPABASE_URL;
      const anonKey = config.VITE_SUPABASE_ANON_KEY;
      fetch(`${supabaseUrl}/functions/v1/create-pending`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify(payload),
      }).catch((err) => console.warn('[submitLead] Edge function notification failed (non-critical):', err));

      return { success: true };
    }
  } catch (err) {
    console.error('[submitLead] Supabase exception:', err);
  }

  // LAST RESORT: mailto
  try {
    openMailto(data);
    return { success: true };
  } catch {
    return { success: false, error: 'Submission failed. Please contact us directly.' };
  }
}

/**
 * Submit lead from LeadModal.
 * Uses same Supabase-first pattern with Zod validation.
 */
export async function submitLeadModal(
  payload: Omit<LeadModalPayload, 'source'>,
): Promise<{ success: boolean; error?: string }> {
  const validation = leadModalSchema.safeParse({ ...payload, source: 'lead_modal' });
  if (!validation.success) {
    const msg = validation.error.errors.map(e => e.message).join(', ');
    return { success: false, error: msg };
  }

  try {
    const { error: dbError } = await supabase
      .from('leads')
      .insert({
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone,
        source: 'lead_modal',
        meta: validation.data,
        submitted_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('[submitLeadModal] Supabase error:', dbError);
      return { success: false, error: 'Could not save your enquiry. Please try again.' };
    }

    return { success: true };
  } catch (err) {
    console.error('[submitLeadModal] Exception:', err);
    return { success: false, error: 'Submission failed. Please contact us directly.' };
  }
}

function openMailto(data: WizardData) {
  const subject = encodeURIComponent(`New Lead: ${data.name} - ${data.locality}`);
  const body = encodeURIComponent([
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Preferred Contact: ${data.preferredContact}`,
    '',
    'Property:',
    `- Locality: ${data.locality}`,
    `- Type: ${data.propertyType}`,
    `- Bedrooms: ${data.bedrooms}`,
    `- Sleeps: ${data.sleeps || 'N/A'}`,
    '',
    `Status: ${data.status}`,
    `Timeline: ${data.timeline}`,
    `Goal: ${data.goal}`,
    `Hands-off: ${data.handsOff ? 'Yes' : 'No'}`,
    `MTA Licence Ready: ${data.licenceReady ? 'Yes' : 'No'}`,
    `Upgrade Budget: ${data.upgradeBudget || 'N/A'}`,
    '',
    `Tier: ${computeTier(data)}`,
    `Recommended Plan: ${computePlan(data)}`,
  ].join('\n'));
  window.location.href = `mailto:info@christianopropertymanagement.com?subject=${subject}&body=${body}`;
}
