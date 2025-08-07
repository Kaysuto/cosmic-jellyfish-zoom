import { useSession } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Navigate, Outlet } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const AdminRoute = () => {
  const { session, loading: sessionLoading } = useSession();
  const { profile, loading: profileLoading } = useProfile();

  const loading = sessionLoading || profileLoading;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-24 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;