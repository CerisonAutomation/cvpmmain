import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Users, Search, X, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MALTA_LOCALITIES } from '@/lib/malta-localities';

interface BookingSearchBarProps {
  variant?: 'hero' | 'page';
  onSearch?: (params: { location: string; checkIn: string; checkOut: string; guests: number }) => void;
}

interface FormErrors {
  checkIn?: string;
  checkOut?: string;
}

export default function BookingSearchBar({ variant = 'page', onSearch }: BookingSearchBarProps) {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [showLocations, setShowLocations] = useState(false);
  const [showGuests, setShowGuests] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const locationRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  const filtered = MALTA_LOCALITIES.filter((l) =>
    l.toLowerCase().includes(location.toLowerCase())
  ).slice(0, 6);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (locationRef.current && !locationRef.current.contains(e.target as Node)) setShowLocations(false);
    if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) setShowGuests(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowLocations(false); setShowGuests(false); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Auto-advance checkout by 3 nights when check-in chosen first time
  useEffect(() => {
    if (checkIn && !checkOut) {
      const d = new Date(checkIn);
      d.setDate(d.getDate() + 3);
      setCheckOut(d.toISOString().split('T')[0]);
    }
  }, [checkIn]); // intentionally omit checkOut to avoid re-triggering

  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = checkIn || today;

  const validate = useCallback((): boolean => {
    const errs: FormErrors = {};
    if (!checkIn) errs.checkIn = 'Required';
    if (!checkOut) errs.checkOut = 'Required';
    else if (checkIn && checkOut <= checkIn) errs.checkOut = 'Must be after check-in';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [checkIn, checkOut]);

  function handleSubmit() {
    setTouched({ checkIn: true, checkOut: true });
    if (!validate()) return;
    const params = { location, checkIn, checkOut, guests };
    if (onSearch) {
      onSearch(params);
    } else {
      const sp = new URLSearchParams();
      if (location) sp.set('location', location);
      sp.set('checkIn', checkIn);
      sp.set('checkOut', checkOut);
      sp.set('guests', String(guests));
      navigate(`/properties?${sp.toString()}`);
    }
  }

  function handleCheckInChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setCheckIn(val);
    if (checkOut && val && checkOut <= val) {
      const d = new Date(val);
      d.setDate(d.getDate() + 1);
      setCheckOut(d.toISOString().split('T')[0]);
    }
    setTouched((prev) => ({ ...prev, checkIn: true }));
  }

  function handleCheckOutChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCheckOut(e.target.value);
    setTouched((prev) => ({ ...prev, checkOut: true }));
  }

  const handleGuestChange = (delta: number) => setGuests((g) => Math.max(1, Math.min(16, g + delta)));
  const selectLocation = (loc: string) => { setLocation(loc); setShowLocations(false); };

  const isHero = variant === 'hero';
  // Only allow submit when dates are set
  const canSubmit = Boolean(checkIn && checkOut);

  // Detect system colour scheme for date inputs
  const inputColorScheme = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? '[color-scheme:dark]'
      : '[color-scheme:light]';

  return (
    <div
      className={`w-full ${isHero ? 'max-w-4xl' : 'max-w-5xl'} mx-auto`}
      role="search"
      aria-label="Property search"
    >
      <div className={`flex flex-col md:flex-row items-stretch gap-0 overflow-hidden border border-border/50 ${
        isHero ? 'bg-card/95 backdrop-blur-md' : 'bg-card'
      }`}>

        {/* LOCATION */}
        <div ref={locationRef} className="relative flex-1 border-b md:border-b-0 md:border-r border-border/30">
          <div className="flex items-center gap-2.5 px-4 py-3">
            <MapPin size={16} className="text-primary shrink-0" aria-hidden />
            <div className="flex-1 min-w-0">
              <label className="block text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-0.5" htmlFor="bsb-location">
                Location
              </label>
              <input
                id="bsb-location"
                type="text"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setShowLocations(true); }}
                onFocus={() => setShowLocations(true)}
                placeholder="All Malta"
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={showLocations}
                aria-controls="bsb-location-list"
                className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none truncate"
              />
            </div>
            {location && (
              <button
                onClick={() => { setLocation(''); setShowLocations(false); }}
                className="text-muted-foreground hover:text-foreground p-0.5"
                aria-label="Clear location"
              >
                <X size={12} aria-hidden />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showLocations && filtered.length > 0 && (
              <motion.ul
                id="bsb-location-list"
                role="listbox"
                aria-label="Location suggestions"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full left-0 right-0 z-50 bg-card border border-border/50 max-h-56 overflow-y-auto"
              >
                {!location && (
                  <li>
                    <button
                      role="option"
                      aria-selected={location === ''}
                      onClick={() => selectLocation('')}
                      className="w-full text-left px-4 py-2.5 text-[12px] text-primary font-medium hover:bg-accent/50 transition-colors flex items-center gap-2 border-b border-border/30"
                    >
                      <MapPin size={12} aria-hidden /> All Malta & Gozo
                    </button>
                  </li>
                )}
                {filtered.map((loc) => (
                  <li key={loc}>
                    <button
                      role="option"
                      aria-selected={location === loc}
                      onClick={() => selectLocation(loc)}
                      className="w-full text-left px-4 py-2 text-[12px] text-foreground hover:bg-accent/50 transition-colors flex items-center gap-2"
                    >
                      <MapPin size={12} className="text-muted-foreground" aria-hidden />
                      {loc}
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* CHECK-IN */}
        <div className={`flex-1 border-b md:border-b-0 md:border-r border-border/30 ${
          errors.checkIn && touched.checkIn ? 'bg-destructive/5' : ''
        }`}>
          <div className="flex items-center gap-2.5 px-4 py-3">
            <CalendarDays size={16} className="text-primary shrink-0" aria-hidden />
            <div className="flex-1 min-w-0">
              <label className="block text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-0.5" htmlFor="bsb-checkin">
                Check-in
              </label>
              <input
                id="bsb-checkin"
                type="date"
                value={checkIn}
                min={today}
                onChange={handleCheckInChange}
                aria-invalid={Boolean(errors.checkIn && touched.checkIn)}
                aria-describedby={errors.checkIn && touched.checkIn ? 'bsb-checkin-err' : undefined}
                className={`w-full bg-transparent text-[13px] text-foreground focus:outline-none ${inputColorScheme}`}
              />
              {errors.checkIn && touched.checkIn && (
                <p id="bsb-checkin-err" className="text-[10px] text-destructive mt-0.5">{errors.checkIn}</p>
              )}
            </div>
          </div>
        </div>

        {/* CHECK-OUT */}
        <div className={`flex-1 border-b md:border-b-0 md:border-r border-border/30 ${
          errors.checkOut && touched.checkOut ? 'bg-destructive/5' : ''
        }`}>
          <div className="flex items-center gap-2.5 px-4 py-3">
            <CalendarDays size={16} className="text-primary shrink-0" aria-hidden />
            <div className="flex-1 min-w-0">
              <label className="block text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-0.5" htmlFor="bsb-checkout">
                Check-out
              </label>
              <input
                id="bsb-checkout"
                type="date"
                value={checkOut}
                min={minCheckOut}
                onChange={handleCheckOutChange}
                aria-invalid={Boolean(errors.checkOut && touched.checkOut)}
                aria-describedby={errors.checkOut && touched.checkOut ? 'bsb-checkout-err' : undefined}
                className={`w-full bg-transparent text-[13px] text-foreground focus:outline-none ${inputColorScheme}`}
              />
              {errors.checkOut && touched.checkOut && (
                <p id="bsb-checkout-err" className="text-[10px] text-destructive mt-0.5">{errors.checkOut}</p>
              )}
            </div>
          </div>
        </div>

        {/* GUESTS */}
        <div ref={guestsRef} className="relative border-b md:border-b-0 md:border-r border-border/30">
          <button
            type="button"
            onClick={() => setShowGuests(!showGuests)}
            aria-label={`${guests} ${guests === 1 ? 'guest' : 'guests'}, change`}
            aria-expanded={showGuests}
            aria-controls="bsb-guests-panel"
            className="flex items-center gap-2.5 px-4 py-3 w-full text-left"
          >
            <Users size={16} className="text-primary shrink-0" aria-hidden />
            <div>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-0.5">Guests</span>
              <span className="text-[13px] text-foreground">{guests} {guests === 1 ? 'guest' : 'guests'}</span>
            </div>
          </button>

          <AnimatePresence>
            {showGuests && (
              <motion.div
                id="bsb-guests-panel"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full right-0 z-50 bg-card border border-border/50 p-4 min-w-[200px]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[12px] font-medium text-foreground">Guests</span>
                    <p className="text-[10px] text-muted-foreground">Max 16</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleGuestChange(-1)}
                      disabled={guests <= 1}
                      aria-label="Remove guest"
                      className="w-7 h-7 border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition-colors"
                    >
                      <Minus size={12} aria-hidden />
                    </button>
                    <span className="text-[13px] font-semibold text-foreground w-5 text-center tabular-nums" aria-live="polite">{guests}</span>
                    <button
                      type="button"
                      onClick={() => handleGuestChange(1)}
                      disabled={guests >= 16}
                      aria-label="Add guest"
                      className="w-7 h-7 border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition-colors"
                    >
                      <Plus size={12} aria-hidden />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SEARCH */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label="Search properties"
          className={`flex items-center justify-center gap-2 px-6 py-3.5 text-[12px] font-semibold transition-colors ${
            canSubmit
              ? 'bg-primary text-primary-foreground hover:opacity-90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          <Search size={14} aria-hidden />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Trust indicators */}
      <div className="flex items-center justify-center gap-4 mt-2 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-green-500" aria-hidden />
          Free cancellation
        </span>
        <span className="hidden sm:flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-green-500" aria-hidden />
          Best price guarantee
        </span>
      </div>
    </div>
  );
}
