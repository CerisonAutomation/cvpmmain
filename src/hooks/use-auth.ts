/**
 * useAuth — Supabase session + role hook.
 * Single source of truth for auth state across the app.
 *
 * FIX: loading is now reset to true on auth state change so AdminGuard
 * never sees loading=false + role=null simultaneously during role fetch.
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
      if (!cancelled) setLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        // Set loading=true so guards wait for the role to resolve —
        // prevents the window where loading=false and role=null simultaneously.
        setLoading(true);
        getUserRole(u.id).then((r) => {
          if (!cancelled) {
            setRole(r);
            setLoading(false);
          }
        }).catch(() => {
          if (!cancelled) {
            setRole(null);
            setLoading(false);
          }
        });
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { user, role, loading };
}
