import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, Users, Search, X, Minus, Plus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MALTA_LOCALITIES } from '@/lib/malta-localities';

interface BookingSearchBarProps {
  variant?: 'hero' | 'page';
  onSearch?: (params: { location: string; checkIn: string; checkOut: string; guests: number }) => void;
}

// Form validation
interface FormErrors {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
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
  const searchRef = useRef<HTMLButtonElement>(null);

  // Filter locations with debounce
  const filtered = MALTA_LOCALITIES.filter((l) =>
    l.toLowerCase().includes(location.toLowerCase())
  ).slice(0, 8);

  // Click outside to close dropdowns
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLocations(false);
        setShowGuests(false);
      }
      // Cmd/Ctrl + Enter to submit
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [location, checkIn, checkOut, guests]);

  // Auto-set checkout to checkIn + 3 days
  useEffect(() => {
    if (checkIn && !checkOut) {
      const d = new Date(checkIn);
      d.setDate(d.getDate() + 3);
      setCheckOut(d.toISOString().split('T')[0]);
    }
  }, [checkIn, checkOut]);

  // Calculate minimum checkout date
  const minCheckIn = new Date().toISOString().split('T')[0];
  const minCheckOut = checkIn || minCheckIn;

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    // Check-in validation
    if (!checkIn) {
      newErrors.checkIn = 'Required';
    } else {
      const checkInDate = new Date(checkIn);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkInDate < today) {
        newErrors.checkIn = 'Cannot be in past';
      }
    }

    // Check-out validation
    if (!checkOut) {
      newErrors.checkOut = 'Required';
    } else if (checkIn && checkOut <= checkIn) {
      newErrors.checkOut = 'Must be after check-in';
    }

    // Guests validation
    if (guests < 1) {
      newErrors.guests = 'At least 1 guest';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [checkIn, checkOut, guests]);

  // Handle form submission
  function handleSubmit() {
    // Mark all fields as touched
    setTouched({ location: true, checkIn: true, checkOut: true, guests: true });
    
    if (!validate()) {
      // Focus first error field
      if (errors.checkIn || errors.checkOut) {
        document.querySelector<HTMLInputElement>('input[type="date"]')?.focus();
      }
      return;
    }

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

  // Handle input changes
  function handleLocationChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocation(e.target.value);
    setShowLocations(true);
    setTouched(prev => ({ ...prev, location: true }));
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: undefined }));
    }
  }

  function handleCheckInChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCheckIn(e.target.value);
    // Reset checkout if it's before new checkin
    if (checkOut && e.target.value && checkOut <= e.target.value) {
      const d = new Date(e.target.value);
      d.setDate(d.getDate() + 1);
      setCheckOut(d.toISOString().split('T')[0]);
    }
    setTouched(prev => ({ ...prev, checkIn: true }));
    if (errors.checkIn) {
      setErrors(prev => ({ ...prev, checkIn: undefined }));
    }
  }

  function handleCheckOutChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCheckOut(e.target.value);
    setTouched(prev => ({ ...prev, checkOut: true }));
    if (errors.checkOut) {
      setErrors(prev => ({ ...prev, checkOut: undefined }));
    }
  }

  function handleGuestChange(delta: number) {
    const newGuests = Math.max(1, Math.min(16, guests + delta));
    setGuests(newGuests);
    setTouched(prev => ({ ...prev, guests: true }));
    if (errors.guests) {
      setErrors(prev => ({ ...prev, guests: undefined }));
    }
  }

  function selectLocation(loc: string) {
    setLocation(loc);
    setShowLocations(false);
    setTouched(prev => ({ ...prev, location: true }));
  }

  const isHero = variant === 'hero';
  const hasErrors = Object.keys(errors).length > 0;
  const isValid = checkIn && checkOut && guests > 0;

  return (
    <div 
      className={`w-full ${isHero ? 'max-w-5xl' : 'max-w-6xl'} mx-auto`}
      role="search"
      aria-label="Property search"
    >
      <div 
        className={`flex flex-col md:flex-row items-stretch gap-0 rounded-2xl overflow-hidden border ${
          hasErrors && Object.keys(touched).length > 2 
            ? 'border-red-500/50 focus-within:border-red-500' 
            : 'border-border/60 focus-within:border-primary/50'
        } ${isHero ? 'bg-card/95 backdrop-blur-xl shadow-2xl' : 'bg-card shadow-lg'}`}
      >
        {/* ── LOCATION ── */}
        <div ref={locationRef} className="relative flex-1 border-b md:border-b-0 md:border-r border-border/30">
          <div className="flex items-start gap-3 px-5 py-4 pt-5">
            <MapPin size={20} className="text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={handleLocationChange}
                onFocus={() => setShowLocations(true)}
                placeholder="Where in Malta?"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none truncate"
                aria-label="Search location"
                autoComplete="off"
                role="combobox"
                aria-expanded={showLocations}
                aria-controls="location-list"
              />
            </div>
            {location && (
              <button 
                onClick={() => { setLocation(''); setShowLocations(false); }} 
                className="text-muted-foreground hover:text-foreground mt-1 p-1"
                aria-label="Clear location"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Location dropdown */}
          <AnimatePresence>
            {showLocations && filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                id="location-list"
                role="listbox"
                className="absolute top-full left-0 right-0 z-50 bg-card border border-border rounded-b-xl shadow-xl max-h-72 overflow-y-auto"
              >
                {!location && (
                  <button
                    onClick={() => selectLocation('')}
                    className="w-full text-left px-5 py-3.5 text-sm text-primary font-medium hover:bg-accent/60 transition-colors flex items-center gap-2 border-b border-border/50"
                    role="option"
                  >
                    <MapPin size={14} /> All of Malta & Gozo
                  </button>
                )}
                {filtered.map((loc, idx) => (
                  <button
                    key={loc}
                    onClick={() => selectLocation(loc)}
                    className="w-full text-left px-5 py-3 text-sm text-foreground hover:bg-accent/60 transition-colors flex items-center gap-3"
                    role="option"
                    aria-selected={location === loc}
                  >
                    <MapPin size={14} className="text-muted-foreground" />
                    {loc}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── CHECK-IN ── */}
        <div className={`flex-1 border-b md:border-b-0 md:border-r border-border/30 ${errors.checkIn && touched.checkIn ? 'bg-red-50/5' : ''}`}>
          <div className="flex items-start gap-3 px-5 py-4 pt-5">
            <CalendarDays size={20} className="text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                min={minCheckIn}
                onChange={handleCheckInChange}
                onBlur={() => setTouched(prev => ({ ...prev, checkIn: true }))}
                className="w-full bg-transparent text-sm text-foreground focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                aria-label="Check-in date"
                aria-invalid={!!(errors.checkIn && touched.checkIn)}
              />
              {errors.checkIn && touched.checkIn && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={10} /> {errors.checkIn}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── CHECK-OUT ── */}
        <div className={`flex-1 border-b md:border-b-0 md:border-r border-border/30 ${errors.checkOut && touched.checkOut ? 'bg-red-50/5' : ''}`}>
          <div className="flex items-start gap-3 px-5 py-4 pt-5">
            <CalendarDays size={20} className="text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                min={minCheckOut}
                onChange={handleCheckOutChange}
                onBlur={() => setTouched(prev => ({ ...prev, checkOut: true }))}
                className="w-full bg-transparent text-sm text-foreground focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                aria-label="Check-out date"
                aria-invalid={!!(errors.checkOut && touched.checkOut)}
              />
              {errors.checkOut && touched.checkOut && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={10} /> {errors.checkOut}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── GUESTS ── */}
        <div ref={guestsRef} className={`relative border-b md:border-b-0 md:border-r border-border/30 ${errors.guests && touched.guests ? 'bg-red-50/5' : ''}`}>
          <button
            onClick={() => setShowGuests(!showGuests)}
            className="flex items-start gap-3 px-5 py-4 pt-5 w-full text-left"
            aria-label={`${guests} guests`}
            aria-expanded={showGuests}
            aria-haspopup="true"
          >
            <Users size={20} className="text-primary shrink-0 mt-0.5" />
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                Guests
              </span>
              <span className="text-sm text-foreground">
                {guests} {guests === 1 ? 'guest' : 'guests'}
              </span>
            </div>
          </button>

          {/* Guests dropdown */}
          <AnimatePresence>
            {showGuests && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 z-50 bg-card border border-border rounded-b-xl shadow-xl p-5 min-w-[240px]"
                role="menu"
              >
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <span className="text-sm font-medium text-foreground">Adults</span>
                    <p className="text-xs text-muted-foreground">Ages 13+</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleGuestChange(-1)}
                      disabled={guests <= 1}
                      className="w-9 h-9 rounded-full border-2 border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      aria-label="Decrease guests"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold text-foreground w-6 text-center">{guests}</span>
                    <button
                      onClick={() => handleGuestChange(1)}
                      disabled={guests >= 16}
                      className="w-9 h-9 rounded-full border-2 border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      aria-label="Increase guests"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                  Maximum 16 guests per booking
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── SEARCH BUTTON ── */}
        <button
          ref={searchRef}
          onClick={handleSubmit}
          className={`
            flex items-center justify-center gap-2.5 px-8 py-5 font-semibold text-sm transition-all
            ${isValid 
              ? 'bg-primary text-primary-foreground hover:opacity-90' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
            }
          `}
          aria-label="Search properties"
          disabled={!isValid}
        >
          <Search size={18} />
          <span className="md:hidden lg:inline">Search</span>
        </button>
      </div>

      {/* Quick tips */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Free cancellation
        </span>
        <span className="hidden sm:flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Best price guarantee
        </span>
        <span className="hidden md:flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          No booking fees
        </span>
      </div>
    </div>
  );
}
