import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useListings } from '@/lib/guesty/hooks';
import { Home, Search, MapPin, Phone, HelpCircle, Star, BookOpen, Lock, Building2 } from 'lucide-react';
import type { Listing } from '@/lib/guesty/types';

/**
 * Enterprise Smart Search (Command Palette)
 * - Keyboard shortcut (Cmd+K / Ctrl+K)
 * - Property search
 * - Navigation shortcuts
 */
export function SmartSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: listings = [] } = useListings();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 md:h-12 md:w-12"
        aria-label="Search and Navigation"
      >
        <Search size={20} />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a property name, city, or command..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Properties">
            {(listings as Listing[]).slice(0, 6).map((listing) => (
              <CommandItem
                key={listing._id}
                onSelect={() => runCommand(() => navigate(`/properties/${listing._id}`))}
                className="flex items-center gap-2"
              >
                <Home size={16} className="text-muted-foreground" />
                <span className="flex-1 truncate">{listing.title}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star size={10} className="fill-primary text-primary" />
                  {listing.reviews?.averageRating || 'New'}
                </span>
              </CommandItem>
            ))}
            <CommandItem onSelect={() => runCommand(() => navigate('/properties'))}>
              <Search size={16} className="mr-2 h-4 w-4" />
              <span>View all properties...</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
              <Home size={16} className="mr-2 h-4 w-4" />
              <span>Home</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/owners'))}>
              <MapPin size={16} className="mr-2 h-4 w-4" />
              <span>Owner Services</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/owners/portal'))}>
              <Lock size={16} className="mr-2 h-4 w-4" />
              <span>Owner Portal</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/contact'))}>
              <Phone size={16} className="mr-2 h-4 w-4" />
              <span>Contact Us</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/faq'))}>
              <HelpCircle size={16} className="mr-2 h-4 w-4" />
              <span>Frequently Asked Questions</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Locations">
            {[
              { label: 'Sliema', slug: 'sliema' },
              { label: 'Valletta', slug: 'valletta' },
              { label: "St Julian's", slug: 'st-julians' },
              { label: 'Gozo', slug: 'gozo' },
              { label: 'Mellieħa', slug: 'mellieha' },
            ].map(({ label, slug }) => (
              <CommandItem
                key={slug}
                onSelect={() => runCommand(() => navigate(`/locations/${slug}`))}
              >
                <Building2 size={16} className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Properties in {label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
