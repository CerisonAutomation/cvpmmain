import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight, Phone, Mail, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitLeadModal } from '@/lib/submission';

interface LeadModalProps {
  open: boolean;
  onClose: () => void;
  context?: 'owner' | 'guest' | 'general';
}

type Step1Data = { intent: 'owner' | 'guest' | ''; situation: string; goal: string };
type Step2Data = { name: string; phone: string; email: string; consent: boolean };

const OWNER_SITUATIONS = [
  { value: 'new', label: "I'm not listed yet" },
  { value: 'listed', label: 'Already listed, want better results' },
  { value: 'switching', label: 'Switching property manager' },
];
const OWNER_GOALS = [
  { value: 'max_income', label: 'Maximise income' },
  { value: 'hands_off', label: 'Hands-off management' },
  { value: 'direct', label: 'Direct bookings' },
  { value: 'reviews', label: 'Better reviews' },
];
const GUEST_GOALS = [
  { value: 'book', label: 'Book a property' },
  { value: 'info', label: 'Get more info' },
  { value: 'group', label: 'Group / long stay enquiry' },
];

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150',
        selected
          ? 'border-primary bg-primary/10 text-foreground'
          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
      )}
    >
      <span className="flex items-center justify-between">
        {label}
        {selected && <Check size={14} className="text-primary flex-shrink-0" />}
      </span>
    </button>
  );
}

function SuccessView({ name, intent }: { name: string; intent: 'owner' | 'guest' | '' }) {
  return (
    <div className="py-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
        <Check size={24} className="text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-lg">Thank you{name ? `, ${name.split(' ')[0]}` : ''}!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {intent === 'owner'
            ? "We'll be in touch within 24 hours with your personalised income estimate."
            : "We'll reach out shortly to help plan your Malta stay."}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">Or call us now: <a href="tel:+35679790202" className="text-primary font-medium">+356 7979 0202</a></p>
    </div>
  );
}

function Step1View({ s1, setS1 }: { s1: Step1Data; setS1: React.Dispatch<React.SetStateAction<Step1Data>> }) {
  return (
    <div className="space-y-5">
      {s1.intent === '' && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">I am a…</p>
          <div className="grid grid-cols-2 gap-2">
            <Chip label="Property owner" selected={s1.intent === 'owner'} onClick={() => setS1(p => ({ ...p, intent: 'owner', situation: '', goal: '' }))} />
            <Chip label="Guest / traveller" selected={s1.intent === 'guest'} onClick={() => setS1(p => ({ ...p, intent: 'guest', situation: '', goal: '' }))} />
          </div>
        </div>
      )}
      {s1.intent !== '' && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {s1.intent === 'owner' ? 'My situation' : "I'd like to…"}
          </p>
          <div className="space-y-2">
            {(s1.intent === 'owner' ? OWNER_SITUATIONS : GUEST_GOALS).map(o => (
              <Chip key={o.value} label={o.label} selected={s1.situation === o.value} onClick={() => setS1(p => ({ ...p, situation: o.value }))} />
            ))}
          </div>
        </div>
      )}
      {s1.intent === 'owner' && s1.situation !== '' && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">My main goal</p>
          <div className="grid grid-cols-2 gap-2">
            {OWNER_GOALS.map(o => (
              <Chip key={o.value} label={o.label} selected={s1.goal === o.value} onClick={() => setS1(p => ({ ...p, goal: o.value }))} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Step2View({ s2, setS2, firstFieldRef }: { s2: Step2Data; setS2: React.Dispatch<React.SetStateAction<Step2Data>>; firstFieldRef: React.RefObject<HTMLInputElement> }) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={firstFieldRef}
          type="text"
          placeholder="Full name"
          value={s2.name}
          onChange={e => setS2(p => ({ ...p, name: e.target.value }))}
          autoComplete="name"
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="relative">
        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="tel"
          placeholder="Phone number"
          value={s2.phone}
          onChange={e => setS2(p => ({ ...p, phone: e.target.value }))}
          autoComplete="tel"
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="relative">
        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="email"
          placeholder="Email address"
          value={s2.email}
          onChange={e => setS2(p => ({ ...p, email: e.target.value }))}
          autoComplete="email"
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={s2.consent}
          onChange={e => setS2(p => ({ ...p, consent: e.target.checked }))}
          className="mt-0.5 accent-primary"
        />
        <span className="text-xs text-muted-foreground leading-relaxed">
          I agree to be contacted by Christiano Vincenti Property Management.{' '}
          <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
        </span>
      </label>
    </div>
  );
}

export default function LeadModal({ open, onClose, context = 'general' }: LeadModalProps) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [s1, setS1] = useState<Step1Data>({ intent: context === 'owner' ? 'owner' : context === 'guest' ? 'guest' : '', situation: '', goal: '' });
  const [s2, setS2] = useState<Step2Data>({ name: '', phone: '', email: '', consent: false });
  const firstFieldRef = useRef<HTMLInputElement>(null);
  // Prevent double-submit
  const submittingRef = useRef(false);

  useEffect(() => {
    if (open) {
      setStep(0); setSubmitted(false); setLoading(false); setSubmitError(null);
      submittingRef.current = false;
      setS1({ intent: context === 'owner' ? 'owner' : context === 'guest' ? 'guest' : '', situation: '', goal: '' });
      setS2({ name: '', phone: '', email: '', consent: false });
    }
  }, [open, context]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  useEffect(() => { if (step === 1) setTimeout(() => firstFieldRef.current?.focus(), 150); }, [step]);

  const step1Complete = s1.intent !== '' && s1.situation !== '' && (s1.intent === 'guest' || s1.goal !== '');
  const canSubmit = s2.name.trim().length > 1 && s2.phone.trim().length > 6 && s2.email.includes('@') && s2.consent;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || loading || submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setSubmitError(null);
    try {
      const result = await submitLeadModal({
        intent: s1.intent as 'owner' | 'guest',
        situation: s1.situation,
        goal: s1.goal || undefined,
        name: s2.name,
        phone: s2.phone,
        email: s2.email,
        consent: true,
      });
      if (!result.success) {
        setSubmitError(result.error ?? 'Submission failed. Please try again.');
        submittingRef.current = false;
        return;
      }
      setSubmitted(true);
    } catch (err) {
      console.error('[LeadModal] handleSubmit:', err);
      setSubmitError('Something went wrong. Please try again or call us directly.');
      submittingRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [s1, s2, canSubmit, loading]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            onClick={onClose} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" aria-hidden />
          <motion.div key="panel" role="dialog" aria-modal="true" aria-label="Get in touch"
            initial={{ opacity: 0, y: 32, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 32, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-full sm:max-w-md bg-card border border-border/60 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div>
                <p className="text-xs tracking-widest text-primary uppercase font-medium">
                  {submitted ? 'Done' : step === 0 ? 'Step 1 of 2' : 'Step 2 of 2'}
                </p>
                <h2 className="font-serif text-lg font-semibold text-foreground mt-0.5">
                  {submitted ? "We'll be in touch" : step === 0 ? 'Tell us about yourself' : 'Your contact details'}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Close">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {submitted
                ? <SuccessView name={s2.name} intent={s1.intent} />
                : step === 0
                ? <Step1View s1={s1} setS1={setS1} />
                : <Step2View s2={s2} setS2={setS2} firstFieldRef={firstFieldRef} />}
            </div>
            {!submitted && (
              <div className="px-5 pb-5 pt-2 border-t border-border/30 flex flex-col gap-2">
                {submitError && (
                  <div role="alert" className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                    <AlertCircle size={13} className="shrink-0" />
                    {submitError}
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  {step === 1
                    ? <button type="button" onClick={() => setStep(0)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back</button>
                    : <span />}
                  {step === 0 ? (
                    <button type="button" onClick={() => setStep(1)} disabled={!step1Complete}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                      Continue <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button type="button" onClick={handleSubmit} disabled={!canSubmit || loading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                      {loading ? 'Sending…' : <><span>Send Enquiry</span> <ArrowRight size={14} /></>}
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
