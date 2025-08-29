import { Outlet, useNavigate } from 'react-router-dom';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getGravatarURL } from '@/lib/gravatar';
import { LogOut, User, ArrowLeft, Settings, Crown, Menu, ChevronDown, BarChart3, Wrench, AlertTriangle, Calendar, Users, Film, Cog, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
import { motion } from 'framer-motion';
import AdminNavigation from '@/components/admin/AdminNavigation';
import AdminNotifications from '@/components/admin/AdminNotifications';
import { cn } from '@/lib/utils';

const Admin = () => {
  const { t } = useSafeTranslation();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useProfile();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Navigation items pour le menu mobile avec icônes Lucide
  const adminNavItems = [
    { to: "/admin", label: t('analytics'), icon: BarChart3 },
    { to: "/admin/services", label: t('manage_services'), icon: Wrench },
    { to: "/admin/incidents", label: t('manage_incidents'), icon: AlertTriangle },
    { to: "/admin/maintenance", label: t('manage_maintenance'), icon: Calendar },
    { to: "/admin/users", label: t('manage_users'), icon: Users },
    { to: "/admin/jellyfin", label: t('jellyfin_tab_title'), icon: Film },
    { to: "/admin/settings", label: t('settings'), icon: Cog },
    { to: "/admin/logs", label: t('logs'), icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Navigation desktop */}
            <div className="flex-1 hidden lg:block">
              <AdminNavigation />
            </div>

            {/* Right side - Desktop elements */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:flex items-center gap-3"
            >
              <Button variant="outline" size="sm" asChild>
                <a href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour</span>
                </a>
              </Button>

              {/* Notifications */}
              <AdminNotifications />

              {/* User Profile - Style compact comme la navbar par défaut */}
              {profileLoading ? (
                <Skeleton className="h-10 w-10 rounded-full" />
              ) : profile ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-3 px-2 py-1 h-auto rounded-lg"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={profile.avatar_url || getGravatarURL(profile.email)} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                          {profile.first_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-medium text-foreground">{profile.first_name}</span>
                        <span className="text-xs text-muted-foreground">Administrateur</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={profile.avatar_url || getGravatarURL(profile.email)} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                              {profile.first_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium leading-none">
                              {profile.first_name} {profile.last_name}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground mt-1">
                              {profile.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/profile" className="w-full cursor-pointer flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Mon Profil</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/admin/settings" className="w-full cursor-pointer flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>{t('settings')}</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogoutClick} 
                      className="text-destructive cursor-pointer flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t('logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </motion.div>

                        {/* Mobile elements - Notifications et menu burger */}
            <div className="lg:hidden flex items-center gap-2">
              {/* Notifications */}
              <AdminNotifications />
              
              {/* Menu burger */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="p-2 rounded-lg hover:bg-accent focus-visible:outline-none focus-visible:ring-0"
                    aria-label="Ouvrir le menu d'administration"
                  >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Ouvrir le menu admin</span>
                  </Button>
                </SheetTrigger>

                <SheetContent side="right" className="bg-background/95 backdrop-blur-xl border-l border-border/50 w-[320px]">
                  <div className="flex flex-col h-full">
                    {/* Header du menu mobile */}
                    <div className="px-4 pt-6 pb-4 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10">
                          <Crown className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">Panel Admin</p>
                          <p className="text-sm text-muted-foreground">Gestion de l'infrastructure</p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation mobile */}
                    <div className="flex-grow p-4 space-y-2 overflow-y-auto">
                      {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <a
                            key={item.to}
                            href={item.to}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                            onClick={() => setIsSheetOpen(false)}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </a>
                        );
                      })}

                      <div className="border-t border-border/50 my-4" />

                      {/* Actions rapides */}
                      <div className="px-2 text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-2">
                        Actions
                      </div>
                      <a
                        href="/"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <ArrowLeft className="h-5 w-5" />
                        <span>Retour au site</span>
                      </a>
                    </div>

                    {/* Footer du menu mobile */}
                    <div className="px-4 pb-6">
                      <Button 
                        onClick={() => { setIsSheetOpen(false); handleLogoutClick(); }} 
                        variant="destructive" 
                        className="w-full"
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        {t('logout')}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex-1"
      >
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </motion.main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="w-full border-t border-border/50 bg-background/50 backdrop-blur-sm"
      >
        <FooterContent />
      </motion.footer>

      {/* Logout Dialog */}
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
            <AlertDialogAction 
              onClick={confirmLogout} 
              className="bg-destructive hover:bg-destructive/90"
            >
              {t('logout')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;