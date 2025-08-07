import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSession } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getGravatarURL } from '@/lib/gravatar';
import { BarChart2, Wrench, AlertTriangle, Calendar, Users, Settings, LogOut, User } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const AdminSidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile, loading: profileLoading } = useProfile();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { to: '/admin', label: t('analytics'), icon: BarChart2, exact: true },
    { to: '/admin/services', label: t('manage_services'), icon: Wrench },
    { to: '/admin/incidents', label: t('manage_incidents'), icon: AlertTriangle },
    { to: '/admin/maintenance', label: t('manage_maintenance'), icon: Calendar },
    { to: '/admin/users', label: t('manage_users'), icon: Users },
  ];

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
      isActive && 'bg-muted text-primary'
    );

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <Wrench className="h-6 w-6" />
            <span className="">{t('admin_panel')}</span>
          </NavLink>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.exact} className={navLinkClasses}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          {profileLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ) : profile && session ? (
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatar_url || getGravatarURL(profile.email)} />
                  <AvatarFallback>{profile.first_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{profile.first_name}</p>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <Button variant="outline" size="sm" asChild>
                  <NavLink to="/admin/profile"><User className="h-4 w-4" /></NavLink>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <NavLink to="/admin/settings"><Settings className="h-4 w-4" /></NavLink>
                </Button>
                <Button variant="destructive" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;