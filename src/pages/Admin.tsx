import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getGravatarURL } from '@/lib/gravatar';
import { BarChart2, Wrench, AlertTriangle, Calendar, Users, Settings, LogOut, User, ArrowLeft, FileText, MailQuestion } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FooterContent } from '@/components/layout/FooterContent';

const Admin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { to: '/admin', label: t('analytics'), icon: BarChart2, exact: true },
    { to: '/admin/services', label: t('manage_services'), icon: Wrench },
    { to: '/admin/incidents', label: t('manage_incidents'), icon: AlertTriangle },
    { to: '/admin/maintenance', label: t('manage_maintenance'), icon: Calendar },
    { to: '/admin/users', label: t('manage_users'), icon: Users },
    { to: '/admin/requests', label: t('requests'), icon: MailQuestion },
    { to: '/admin/settings', label: t('settings'), icon: Settings },
    { to: '/admin/logs', label: t('logs'), icon: FileText },
  ];

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    );

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('admin_panel')}</h1>
                <p className="text-muted-foreground">{t('admin_panel_description')}</p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" asChild>
                  <NavLink to="/"><ArrowLeft className="mr-2 h-4 w-4" /> {t('return_home')}</NavLink>
                </Button>
                {profileLoading ? (
                  <Skeleton className="h-10 w-10 rounded-full" />
                ) : profile ? (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profile.avatar_url || getGravatarURL(profile.email)} />
                          <AvatarFallback>{profile.first_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{profile.first_name} {profile.last_name}</p>
                          <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild><NavLink to="/profile" className="w-full cursor-pointer"><User className="mr-2 h-4 w-4" /><span>Profil</span></NavLink></DropdownMenuItem>
                      <DropdownMenuItem asChild><NavLink to="/admin/settings" className="w-full cursor-pointer"><Settings className="mr-2 h-4 w-4" /><span>{t('settings')}</span></NavLink></DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogoutClick} className="text-destructive cursor-pointer"><LogOut className="mr-2 h-4 w-4" /><span>{t('logout')}</span></DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
            </div>
            <nav className="overflow-x-auto pb-2">
              <div className="flex items-center gap-2 border-b">
                {navItems.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.exact} className={navLinkClasses}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </nav>
          </header>
          <main>
            <Outlet />
          </main>
        </div>
      </div>
      <footer className="w-full border-t">
        <FooterContent />
      </footer>
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_logout_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_logout_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-destructive hover:bg-destructive/90">
              {t('logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;