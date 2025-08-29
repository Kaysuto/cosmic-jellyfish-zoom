import { useParams, useNavigate } from 'react-router-dom';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { useUserById } from '@/hooks/useUserById';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

import UserProfileCard from '@/components/admin/profile/UserProfileCard';
import UpdateProfileForm from '@/components/admin/profile/UpdateProfileForm';
import AdminUpdateUserForm from '@/components/admin/profile/AdminUpdateUserForm';
import AdminMfaManager from '@/components/admin/profile/AdminMfaManager';
import { useSession } from '@/contexts/AuthContext';

const EditUserPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { t } = useSafeTranslation();
  const { user, loading, refreshUser } = useUserById(userId);
  const { session } = useSession();

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-10 w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Skeleton className="h-56 w-full" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return <div>{t('user_not_found')}</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="space-y-6"
    >
      <Button variant="outline" onClick={() => navigate('/admin/users')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('back_to_users')}
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6">
          <UserProfileCard profile={user} session={session} onProfileUpdate={refreshUser} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <UpdateProfileForm profile={user} />
          <AdminUpdateUserForm user={user} />
          <AdminMfaManager user={user} />
        </div>
      </div>
    </motion.div>
  );
};

export default EditUserPage;