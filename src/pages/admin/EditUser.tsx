import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserById } from '@/hooks/useUserById';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

import UserProfileCard from '@/components/admin/profile/UserProfileCard';
import UpdateProfileForm from '@/components/admin/profile/UpdateProfileForm';
import UpdateEmailForm from '@/components/admin/profile/UpdateEmailForm';
import UpdatePasswordForm from '@/components/admin/profile/UpdatePasswordForm';
import MfaManager from '@/components/admin/profile/MfaManager';

const EditUserPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading, refreshUser } = useUserById(userId);

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
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <Button variant="outline" onClick={() => navigate('/admin/users')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('back_to_users')}
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6">
          {/* Note: UserProfileCard might need adjustments if it relies on session */}
          <UserProfileCard profile={user} session={null} onProfileUpdate={refreshUser} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <UpdateProfileForm profile={user} />
          {/* These components might need refactoring to work for another user */}
          {/* For now, they might only work for the logged-in user */}
          {/* <MfaManager />
          <UpdateEmailForm profile={user} />
          <UpdatePasswordForm /> */}
        </div>
      </div>
    </motion.div>
  );
};

export default EditUserPage;