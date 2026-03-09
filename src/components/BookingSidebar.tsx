/**
 * Enhanced Booking Sidebar
 * - Compact, premium design
 * - Integrated calendar & quote
 * - Form validation
 * - Guest selector
 */
import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Minus, Plus, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import QuoteDisplay from './QuoteDisplay';
import { cn } from '@/lib/utils';
import type { Quote } from '@/lib/guesty/types';

interface BookingSidebarProps {
  basePrice: number;
  maxGuests: number;
  rating?: number;
  reviewCount?: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  onGuestsChange: (count: number) => void;
  onGetQuote: () => void;
  onBook: () => void;
  quote: Quote | null;
  isLoadingQuote: boolean;
  quoteError?: string;
  isBooking?: boolean;
  className?: string;
}

export default function BookingSidebar({
  basePrice,
  maxGuests,
  rating,
  reviewCount,
  checkIn,
  checkOut,
  guests,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onGetQuote,
  onBook,
  quote,
  isLoadingQuote,
  quoteError,
  isBooking,
  className,
}: BookingSidebarProps) {
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const nightsCount = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const canBook = quote && !isLoadingQuote && nightsCount > 0;

  return (
    <div className={cn('sticky top-24', className)}>
      <div className="satin-surface border border-border/50 rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-border/30">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-foreground">€{basePrice}</span>
              <span className="text-muted-foreground text-sm"> / night</span>
            </div>
            {rating && rating > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <span className="text-primary">★</span>
                <span className="font-semibold">{rating.toFixed(1)}</span>
                {reviewCount && (
                  <span className="text-muted-foreground">({reviewCount})</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          {/* Date inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Check-in
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  value={checkIn}
                  onChange={(e) => onCheckInChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="pl-9 h-10 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Check-out
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  value={checkOut}
                  onChange={(e) => onCheckOutChange(e.target.value)}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  className="pl-9 h-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Guest selector */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Guests
            </Label>
            <button
              type="button"
              onClick={() => setShowGuestPicker(!showGuestPicker)}
              className="w-full h-10 px-3 flex items-center justify-between border border-input bg-background rounded-md text-sm hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{guests} {guests === 1 ? 'guest' : 'guests'}</span>
              </div>
              <motion.span
                animate={{ rotate: showGuestPicker ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-muted-foreground"
              >
                ▾
              </motion.span>
            </button>

            <AnimatePresence>
              {showGuestPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Max {maxGuests} guests
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onGuestsChange(Math.max(1, guests - 1))}
                        disabled={guests <= 1}
                        className="w-8 h-8 flex items-center justify-center border border-border rounded-full hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-semibold">{guests}</span>
                      <button
                        type="button"
                        onClick={() => onGuestsChange(Math.min(maxGuests, guests + 1))}
                        disabled={guests >= maxGuests}
                        className="w-8 h-8 flex items-center justify-center border border-border rounded-full hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quote / Get Quote */}
          {nightsCount > 0 && !quote && !isLoadingQuote && (
            <Button
              onClick={onGetQuote}
              variant="outline"
              className="w-full"
              disabled={!checkIn || !checkOut}
            >
              Check Availability
            </Button>
          )}

          {/* Price display */}
          <QuoteDisplay
            quote={quote}
            nights={nightsCount}
            basePrice={basePrice}
            isLoading={isLoadingQuote}
            error={quoteError}
          />

          {/* Book button */}
          <Button
            onClick={onBook}
            disabled={!canBook || isBooking}
            className="w-full h-12 text-base font-semibold"
          >
            {isBooking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : canBook ? (
              'Reserve Now'
            ) : (
              'Select dates to book'
            )}
          </Button>

          {/* Info */}
          <p className="text-[11px] text-center text-muted-foreground">
            You won't be charged yet
          </p>
        </div>

        {/* Trust badges */}
        <div className="px-5 py-3 bg-muted/20 border-t border-border/30">
          <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Check size={10} className="text-primary" /> Instant confirmation
            </span>
            <span className="flex items-center gap-1">
              <Check size={10} className="text-primary" /> Free cancellation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
