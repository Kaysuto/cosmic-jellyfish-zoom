import { useParams } from 'react-router-dom';
import { useSession } from '@/contexts/AuthContext';
import Profile from './Profile';
import UserPublicProfile from './UserPublicProfile';

const ProfileIndex = () => {
  const { userId } = useParams<{ userId: string }>();
  const { session } = useSession();

  const isOwner = session?.user?.id === userId;
  return isOwner ? <Profile /> : <UserPublicProfile />;
};

export default ProfileIndex;


