/**
 * AdminGuard — protects any route requiring admin role.
 * Shows spinner while loading, redirects to / if not admin.
 *
 * SECURITY: VITE_ADMIN_BYPASS is ONLY honoured in DEV builds.
 * It is physically impossible to bypass in production even if the
 * env var is mistakenly set, because import.meta.env.DEV is
 * replaced at build time by Vite and will be `false` in prod bundles.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();

  // Only allow bypass in development builds — import.meta.env.DEV is
  // statically replaced to `false` by Vite in production bundles.
  const bypass = import.meta.env.DEV && import.meta.env.VITE_ADMIN_BYPASS === 'true';

  if (loading && !bypass) {
    return (
      <div className="min-h-screen flex items-center justify-center" aria-label="Checking authorisation">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (bypass) {
    return <>{children}</>;
  }

  if (!user || role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
