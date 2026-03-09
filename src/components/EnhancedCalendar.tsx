/**
 * Enhanced Booking Calendar
 * - Clean grid with strong availability contrast
 * - Elegant disabled states
 * - Touch-optimized for mobile
 * - Keyboard navigation
 */
import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CalendarDay } from '@/lib/guesty/types';

interface EnhancedCalendarProps {
  availabilityMap: Map<string, CalendarDay>;
  checkIn: string;
  checkOut: string;
  onDateSelect: (date: string) => void;
  minDate?: Date;
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getMonthDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const days: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

export default function EnhancedCalendar({
  availabilityMap,
  checkIn,
  checkOut,
  onDateSelect,
  minDate = new Date(),
  className,
}: EnhancedCalendarProps) {
  const [calMonth, setCalMonth] = useState(() => ({
    year: minDate.getFullYear(),
    month: minDate.getMonth(),
  }));

  const todayStr = toLocalDate(new Date());
  const minDateStr = toLocalDate(minDate);
  const monthDays = getMonthDays(calMonth.year, calMonth.month);

  const navigateMonth = useCallback((delta: number) => {
    setCalMonth((prev) => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  }, []);

  const nightsCount = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, dateStr: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDateSelect(dateStr);
    }
  }, [onDateSelect]);

  return (
    <div className={cn('satin-surface rounded-xl p-4 sm:p-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-accent rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-semibold text-sm">
          {MONTH_NAMES[calMonth.month]} {calMonth.year}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-accent rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Select dates">
        {monthDays.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="h-10 sm:h-11" />;
          }

          const dateStr = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const calDay = availabilityMap.get(dateStr);
          const isPast = dateStr < minDateStr;
          const isBlocked = calDay ? !calDay.available : false;
          const isDisabled = isPast || isBlocked;
          const isCheckIn = dateStr === checkIn;
          const isCheckOut = dateStr === checkOut;
          const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;
          const isToday = dateStr === todayStr;
          const price = calDay?.price;

          return (
            <motion.button
              key={dateStr}
              onClick={() => !isDisabled && onDateSelect(dateStr)}
              onKeyDown={(e) => !isDisabled && handleKeyDown(e, dateStr)}
              disabled={isDisabled}
              whileTap={!isDisabled ? { scale: 0.95 } : undefined}
              role="gridcell"
              aria-selected={isCheckIn || isCheckOut}
              aria-disabled={isDisabled}
              aria-label={`${day} ${MONTH_NAMES[calMonth.month]} ${calMonth.year}${isDisabled ? ', unavailable' : ''}${price ? `, €${Math.round(price)} per night` : ''}`}
              className={cn(
                'relative h-10 sm:h-11 rounded text-xs font-medium transition-all',
                'focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1',
                isCheckIn || isCheckOut
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : isInRange
                  ? 'bg-primary/10 text-foreground'
                  : isDisabled
                  ? 'text-muted-foreground/25 cursor-not-allowed'
                  : 'text-foreground hover:bg-accent cursor-pointer',
                isToday && !isCheckIn && !isCheckOut && !isInRange && 'ring-1 ring-primary/30'
              )}
            >
              <span className={cn(isDisabled && !isPast && 'line-through')}>{day}</span>
              {price && !isDisabled && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[7px] text-muted-foreground opacity-70">
                  €{Math.round(price)}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-3 border-t border-border/30 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Selected
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-primary/10" /> Stay range
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-muted opacity-30" /> Unavailable
        </span>
        {nightsCount > 0 && (
          <span className="ml-auto font-medium text-foreground">
            {nightsCount} {nightsCount === 1 ? 'night' : 'nights'}
          </span>
        )}
      </div>
    </div>
  );
}
