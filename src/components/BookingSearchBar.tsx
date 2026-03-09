import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Users, Search, X, Minus, Plus, AlertCircle } from 'lucide-react';
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
    if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
      setShowLocations(false);
    }
    if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) {
      setShowGuests(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLocations(false);
        setShowGuests(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (checkIn && !checkOut) {
      const d = new Date(checkIn);
      d.setDate(d.getDate() + 3);
      setCheckOut(d.toISOString().split('T')[0]);
    }
  }, [checkIn, checkOut]);

  const minCheckIn = new Date().toISOString().split('T')[0];
  const minCheckOut = checkIn || minCheckIn;

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    if (!checkIn) {
      newErrors.checkIn = 'Required';
    }
    if (!checkOut) {
      newErrors.checkOut = 'Required';
    } else if (checkIn && checkOut <= checkIn) {
      newErrors.checkOut = 'After check-in';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      if (checkIn) sp.set('checkIn', checkIn);
      if (checkOut) sp.set('checkOut', checkOut);
      sp.set('guests', String(guests));
      navigate(`/properties?${sp.toString()}`);
    }
  }

  function handleCheckInChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCheckIn(e.target.value);
    if (checkOut && e.target.value && checkOut <= e.target.value) {
      const d = new Date(e.target.value);
      d.setDate(d.getDate() + 1);
      setCheckOut(d.toISOString().split('T')[0]);
    }
    setTouched(prev => ({ ...prev, checkIn: true }));
  }

  function handleCheckOutChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCheckOut(e.target.value);
    setTouched(prev => ({ ...prev, checkOut: true }));
  }

  function handleGuestChange(delta: number) {
    setGuests(Math.max(1, Math.min(16, guests + delta)));
  }

  function selectLocation(loc: string) {
    setLocation(loc);
    setShowLocations(false);
  }

  const isHero = variant === 'hero';
  const isValid = checkIn && checkOut && guests > 0;

  return (
    <div 
      className={`w-full ${isHero ? 'max-w-4xl' : 'max-w-5xl'} mx-auto`}
      role="search"
      aria-label="Property search"
    >
      <div 
        className={`flex flex-col md:flex-row items-stretch gap-0 overflow-hidden border border-border/50 ${
          isHero ? 'bg-card/95 backdrop-blur-md' : 'bg-card'
        }`}
      >
        {/* LOCATION */}
        <div ref={locationRef} className="relative flex-1 border-b md:border-b-0 md:border-r border-border/30">
          <div className="flex items-center gap-2.5 px-4 py-3">
            <MapPin size={16} className="text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-0.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setShowLocations(true); }}
                onFocus={() => setShowLocations(true)}
                placeholder="All Malta"
                className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none truncate"
                autoComplete="off"
              />
            </div>
            {location && (
              <button 
                onClick={() => { setLocation(''); setShowLocations(false); }} 
                className="text-muted-foreground hover:text-foreground p-0.5"
                aria-label="Clear"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showLocations && filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full left-0 right-0 z-50 bg-card border border-border/50 max-h-56 overflow-y-auto"
              >
                {!location && (
                  <button
                    onClick={() => selectLocation('')}
                    className="w-full text-left px-4 py-2.5 text-[12px] text-primary font-medium hover:bg-accent/50 transition-colors flex items-center gap-2 border-b border-border/30"
                  >
                    <MapPin size={12} /> All Malta & Gozo
                  </button>
                )}
                {filtered.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => selectLocation(loc)}
                    className="w-full text-left px-4 py-2 text-[12px] text-foreground hover:bg-accent/50 transition-colors flex items-center gap-2"
                  >
                    <MapPin size={12} className="text-muted-foreground" />
                    {loc}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CHECK-IN */}
        <div className={`flex-1 border-b md:border-b-0 md:border-r border-border/30 ${errors.checkIn && touched.checkIn ? 'bg-destructive/5' : ''}`}>
          <div className="flex items-center gap-2.5 px-4 py-3">
            <CalendarDays size={16} className="text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-0.5">
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                min={minCheckIn}
                onChange={handleCheckInChange}
                className="w-full bg-transparent text-[13px] text-foreground focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* CHECK-OUT */}
        <div className={`flex-1 border-b md:border-b-0 md:border-r border-border/30 ${errors.checkOut && touched.checkOut ? 'bg-destructive/5' : ''}`}>
          <div className="flex items-center gap-2.5 px-4 py-3">
            <CalendarDays size={16} className="text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-0.5">
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                min={minCheckOut}
                onChange={handleCheckOutChange}
                className="w-full bg-transparent text-[13px] text-foreground focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* GUESTS */}
        <div ref={guestsRef} className="relative border-b md:border-b-0 md:border-r border-border/30">
          <button
            onClick={() => setShowGuests(!showGuests)}
            className="flex items-center gap-2.5 px-4 py-3 w-full text-left"
          >
            <Users size={16} className="text-primary shrink-0" />
            <div>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-0.5">
                Guests
              </span>
              <span className="text-[13px] text-foreground">
                {guests} {guests === 1 ? 'guest' : 'guests'}
              </span>
            </div>
          </button>

          <AnimatePresence>
            {showGuests && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full right-0 z-50 bg-card border border-border/50 p-4 min-w-[200px]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[12px] font-medium text-foreground">Adults</span>
                    <p className="text-[10px] text-muted-foreground">Ages 13+</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGuestChange(-1)}
                      disabled={guests <= 1}
                      className="w-7 h-7 border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-[13px] font-semibold text-foreground w-5 text-center numeric">{guests}</span>
                    <button
                      onClick={() => handleGuestChange(1)}
                      disabled={guests >= 16}
                      className="w-7 h-7 border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary disabled:opacity-30 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SEARCH */}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`flex items-center justify-center gap-2 px-6 py-3.5 text-[12px] font-semibold transition-colors ${
            isValid 
              ? 'bg-primary text-primary-foreground hover:opacity-90' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          <Search size={14} />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Trust indicators */}
      <div className="flex items-center justify-center gap-4 mt-2 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-green-500" />
          Free cancellation
        </span>
        <span className="hidden sm:flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-green-500" />
          Best price guarantee
        </span>
      </div>
    </div>
  );
}
