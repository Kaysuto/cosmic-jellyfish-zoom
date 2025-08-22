import { useSession } from '@/contexts/AuthContext';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const ProfileOwnerRoute = () => {
  const { session, loading } = useSession();
  const { userId } = useParams<{ userId: string }>();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-screen w-full" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.user.id !== userId) {
    // If the user is not the owner, redirect them to the public profile page.
    return <Navigate to={`/users/${userId}`} replace />;
  }

  return <Outlet />;
};

export default ProfileOwnerRoute;