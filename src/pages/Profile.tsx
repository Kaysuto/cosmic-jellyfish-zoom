import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

import UserProfileCard from '@/components/admin/profile/UserProfileCard';
import UpdateProfileForm from '@/components/admin/profile/UpdateProfileForm';
import UpdateEmailForm from '@/components/admin/profile/UpdateEmailForm';
import UpdatePasswordForm from '@/components/admin/profile/UpdatePasswordForm';
import MfaManager from '@/components/admin/profile/MfaManager';

const Profile = () => {
  const { t } = useTranslation();
  const { profile, loading: profileLoading, refreshProfile } = useProfile();
  const { session } = useSession();

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Skeleton className="h-56 w-full" />
      </div>
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {profileLoading || !profile ? <LoadingSkeleton /> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1 space-y-6">
            <UserProfileCard profile={profile} session={session} onProfileUpdate={refreshProfile} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <UpdateProfileForm profile={profile} />
            <MfaManager />
            <UpdateEmailForm profile={profile} />
            <UpdatePasswordForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;