import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { getGravatarURL } from '@/lib/gravatar';
import { Profile } from '@/hooks/useProfile';
import { Session } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface UserProfileCardProps {
  profile: Profile;
  session: Session | null;
}

const UserProfileCard = ({ profile, session }: UserProfileCardProps) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={profile.avatar_url || getGravatarURL(profile.email, 160)} />
            <AvatarFallback className="text-3xl">
              {profile.first_name?.charAt(0)}
              {profile.last_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-1">{t('role')}</h3>
          <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
            {profile.role === 'admin' ? t('admin_role') : t('user_role')}
          </Badge>
        </div>
        {session?.user?.created_at && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-1">{t('member_since')}</h3>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(session.user.created_at), 'd MMMM yyyy', { locale: currentLocale })}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;