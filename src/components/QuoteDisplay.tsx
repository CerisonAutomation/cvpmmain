/**
 * Enhanced Quote Display
 * - Clear price breakdown
 * - Animated totals
 * - Fee explanations
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Quote } from '@/lib/guesty/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuoteDisplayProps {
  quote: Quote | null;
  nights: number;
  basePrice: number;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export default function QuoteDisplay({
  quote,
  nights,
  basePrice,
  isLoading,
  error,
  className,
}: QuoteDisplayProps) {
  // Extract pricing from quote
  const breakdown = quote?.priceBreakdown;
  const accommodationTotal = breakdown?.accommodation || (nights * basePrice);
  const cleaningFee = breakdown?.cleaningFee || 0;
  const serviceFee = breakdown?.fees || 0;
  const taxes = breakdown?.taxes || 0;
  const totalPrice = breakdown?.total || accommodationTotal + cleaningFee + serviceFee + taxes;

  if (error) {
    return (
      <div className={cn('p-4 border border-destructive/30 rounded-lg bg-destructive/5', className)}>
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Unable to get quote</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('p-4 border border-border/50 rounded-lg', className)}>
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Calculating price...</span>
        </div>
      </div>
    );
  }

  if (!nights) {
    return (
      <div className={cn('p-4 border border-border/30 rounded-lg text-center', className)}>
        <p className="text-sm text-muted-foreground">
          Select dates to see pricing
        </p>
      </div>
    );
  }

  return (
    <div className={cn('border border-border/50 rounded-lg overflow-hidden', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={quote?._id || 'estimate'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Line items */}
          <div className="p-4 space-y-2.5">
            <LineItem
              label={`€${basePrice} × ${nights} ${nights === 1 ? 'night' : 'nights'}`}
              amount={accommodationTotal}
            />
            
            {cleaningFee > 0 && (
              <LineItem
                label="Cleaning fee"
                amount={cleaningFee}
                tooltip="One-time cleaning fee for property preparation"
              />
            )}
            
            {serviceFee > 0 && (
              <LineItem
                label="Service fee"
                amount={serviceFee}
                tooltip="Helps us run our platform and offer support"
              />
            )}
            
            {taxes > 0 && (
              <LineItem
                label="Taxes"
                amount={taxes}
                tooltip="Local taxes and fees"
              />
            )}
          </div>

          {/* Total */}
          <div className="px-4 py-3 bg-muted/30 border-t border-border/30">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <motion.span
                key={totalPrice}
                initial={{ scale: 1.05, color: 'hsl(var(--primary))' }}
                animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
                transition={{ duration: 0.3 }}
                className="text-xl font-bold"
              >
                €{Math.round(totalPrice).toLocaleString()}
              </motion.span>
            </div>
          </div>

          {/* Quote status */}
          {quote && (
            <div className="px-4 py-2 bg-primary/5 border-t border-border/30">
              <div className="flex items-center gap-1.5 text-[11px] text-primary">
                <Check size={12} />
                <span>Price confirmed • Valid for 15 minutes</span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function LineItem({
  label,
  amount,
  tooltip,
}: {
  label: string;
  amount: number;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-1 text-muted-foreground">
        {label}
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={12} className="text-muted-foreground/50 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-[200px]">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
      <span className="text-foreground font-medium">€{Math.round(amount).toLocaleString()}</span>
    </div>
  );
}
