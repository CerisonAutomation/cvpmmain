/**
 * AdminGuard — protects any route requiring admin role.
 * Shows spinner while loading, redirects to / if not admin.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
