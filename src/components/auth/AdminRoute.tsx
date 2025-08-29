import { useSession } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const AdminRoute = () => {
  const { session, loading: sessionLoading } = useSession();
  const { profile, loading: profileLoading } = useProfile();
  const location = useLocation();

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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Ne rediriger que si le profil est chargé ET que l'utilisateur n'est pas admin
  if (profile && profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Si le profil n'est pas encore chargé mais que la session existe, continuer à afficher le loading
  if (!profile && session) {
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

  return <Outlet />;
};

export default AdminRoute;