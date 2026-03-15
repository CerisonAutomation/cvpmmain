/**
 * useAuth — Supabase session + role hook.
 * Single source of truth for auth state across the app.
 */
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getUserRole } from '@/lib/dal';

export type AuthState = {
  user: User | null;
  role: string | null;
  loading: boolean;
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      const u = session?.user ?? null;
      setUser(u);

      if (u) {
        const r = await getUserRole(u.id);
        if (!cancelled) setRole(r);
      }
      setLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        getUserRole(u.id).then((r) => { if (!cancelled) setRole(r); });
      } else {
        setRole(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { user, role, loading };
}
