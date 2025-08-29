import { useState, useRef, useMemo, useCallback } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useSafeTranslation } from "@/hooks/useSafeTranslation";
import { Menu, LayoutDashboard, User, LogOut, ChevronDown, Heart, MailQuestion, Film, Calendar, Activity, LayoutGrid, Shield } from "lucide-react";
import { Notifications } from './Notifications';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/contexts/AuthContext";
import { useProfile } from '@/hooks/useProfile';
import { getGravatarURL } from '@/lib/gravatar';
import { supabase } from '@/integrations/supabase/client';
import { useBodyScrollLockCompensation } from '@/hooks/useBodyScrollLockCompensation';
import { motion } from 'framer-motion';
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
import logo from '/logo.png';

const Navbar = () => {
  const { t } = useSafeTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { session, loading: sessionLoading } = useSession();
  const { profile } = useProfile();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isDonateDialogOpen, setIsDonateDialogOpen] = useState(false);
  
  const headerRef = useRef<HTMLElement>(null);
  
  useBodyScrollLockCompensation(headerRef);

  // Navigation items avec icônes - mémorisés pour éviter les re-renders
  const navItems = useMemo(() => [
    { to: "/catalog", label: t('catalog'), icon: Film },
    { to: "/schedule", label: t('schedule'), icon: Calendar },
  ], [t]);

  const handleLogoutClick = useCallback(() => {
    setIsLogoutDialogOpen(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    if (session?.user) {
      await supabase.from('audit_logs').insert({
        user_id: session.user.id,
        action: 'user_logout',
        details: { email: session.user.email }
      });
    }
    await supabase.auth.signOut();
    navigate('/');
  }, [session, navigate]);

  const DONATION_URL = "https://ko-fi.com/playjelly";

  const handleDonateClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDonateDialogOpen(true);
  }, []);

  const confirmDonate = useCallback(() => {
    window.open(DONATION_URL, '_blank', 'noopener,noreferrer');
    setIsDonateDialogOpen(false);
  }, []);

  // Classes pour les liens de navigation desktop - style moderne comme admin
  const navLinkClasses = useCallback(({ isActive }: { isActive: boolean }) =>
    cn(
      'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
      isActive
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
    ), []);

  // Classes pour les liens de navigation mobile
  const mobileNavLinkClasses = useCallback(({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-md",
      "text-muted-foreground hover:text-foreground hover:bg-accent",
      isActive && "text-foreground bg-primary/10 border border-primary/20"
    ), []);

  // Composant UserMenu avec design moderne comme admin
  const UserMenu = useCallback(() => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-3 px-2 py-1 h-auto rounded-lg hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-0"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={profile?.avatar_url || getGravatarURL(profile?.email)} 
              alt={profile?.first_name || 'Avatar'} 
            />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
              {profile?.first_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium text-foreground">{profile?.first_name}</span>
            <span className="text-xs text-muted-foreground">
              {profile?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile?.avatar_url || getGravatarURL(profile?.email)} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                  {profile?.first_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {profile?.email}
                </p>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={`/profile/${profile?.id}`} className="w-full cursor-pointer flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span>Mon Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/requests" className="w-full cursor-pointer flex items-center gap-2">
            <MailQuestion className="h-4 w-4 text-primary" />
            <span>{t('my_requests')}</span>
          </Link>
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
  ), [t, profile, handleLogoutClick]);

  return (
    <>
      {/* Header avec design moderne comme admin */}
      <motion.header 
        ref={headerRef}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo et navigation desktop */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-6"
            >
              <Link to="/" className="flex items-center gap-3 group">
                <img 
                  src={logo} 
                  alt="Jelly Logo" 
                  className="h-8 w-auto group-hover:scale-105 transition-transform duration-300" 
                />
                <span className="hidden sm:block text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Jelly
                </span>
              </Link>

              {/* Navigation desktop - style moderne comme admin */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 0.2, 
                        delay: index * 0.05,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                    >
                      <NavLink to={item.to} className={navLinkClasses}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    </motion.div>
                  );
                })}

                {/* Menu "Plus" avec dropdown */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={cn(navLinkClasses({ isActive: false }), "flex items-center focus-visible:outline-none focus-visible:ring-0")}>
                      <Activity className="h-4 w-4" />
                      <span>{t('more')}</span>
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 p-2">
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-white">
                      <Link to="/status" className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-primary" />
                        {t('status')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-white">
                      <Link to="/about" className="flex items-center gap-3">
                        <User className="h-4 w-4 text-primary" />
                        {t('about_us')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleDonateClick} 
                      onSelect={(e) => e.preventDefault()} 
                      className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg"
                    >
                      <Heart className="mr-3 h-4 w-4" />
                      {t('donate')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>

            {/* Zone utilisateur desktop */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:flex items-center gap-3"
            >
              {session && !sessionLoading ? (
                <>
                  {profile?.role === 'admin' && (
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={cn(navLinkClasses({ isActive: location.pathname.startsWith('/admin') }), "flex items-center focus-visible:outline-none focus-visible:ring-0")}>
                          <LayoutGrid className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 p-2">
                        <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-white">
                          <Link to="/admin" className="flex items-center gap-3">
                            <Shield className="h-4 w-4 text-primary" />
                            {t('admin_dashboard')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-white">
                          <Link to="/requests/manage" className="flex items-center gap-3">
                            <MailQuestion className="h-4 w-4 text-primary" />
                            {t('requests')}
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Notifications />
                  <UserMenu />
                </>
              ) : (
                <Button asChild variant="blueEnhanced">
                  <Link to="/login" state={{ from: location }}>
                    {t('login')}
                  </Link>
                </Button>
              )}
            </motion.div>

            {/* Menu mobile - Notifications et menu burger */}
            <div className="md:hidden flex items-center gap-2">
              {/* Notifications */}
              {session && !sessionLoading && <Notifications />}
              
              {/* Menu burger */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="p-2 rounded-lg hover:bg-accent focus-visible:outline-none focus-visible:ring-0"
                    aria-label="Ouvrir le menu de navigation"
                  >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Ouvrir le menu</span>
                  </Button>
                </SheetTrigger>

                <SheetContent side="right" className="bg-background/95 backdrop-blur-xl border-l border-border/50 w-[320px]">
                  <div className="flex flex-col h-full">
                    {/* Header du menu mobile */}
                    <div className="px-4 pt-6 pb-4 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <img src={logo} alt="Jelly Logo" className="h-8 w-auto" />
                        <div className="flex-1">
                          {session && !sessionLoading ? (
                            <>
                              <p className="font-semibold text-foreground">
                                {profile ? `${profile.first_name} ${profile.last_name}` : session.user?.email?.split('@')[0] || 'Utilisateur'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {profile?.email || session.user?.email || ''}
                              </p>
                            </>
                          ) : (
                            <p className="font-semibold text-foreground">{t('welcome')}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Navigation mobile */}
                    <div className="flex-grow p-4 space-y-2 overflow-y-auto">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink 
                            key={item.to} 
                            to={item.to} 
                            className={mobileNavLinkClasses} 
                            onClick={() => setIsSheetOpen(false)}
                          >
                            <Icon className="h-5 w-5" />
                            {item.label}
                          </NavLink>
                        );
                      })}

                      <NavLink to="/status" className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}>
                        <Activity className="h-5 w-5" />
                        {t('status')}
                      </NavLink>
                      <NavLink to="/about" className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}>
                        <User className="h-5 w-5" />
                        {t('about_us')}
                      </NavLink>

                      <button 
                        onClick={handleDonateClick} 
                        className={cn(mobileNavLinkClasses({ isActive: false }), "text-destructive hover:text-destructive")}
                      >
                        <Heart className="h-5 w-5" />
                        {t('donate')}
                      </button>

                      <div className="border-t border-border/50 my-4" />

                      {/* Section utilisateur mobile */}
                      {session && !sessionLoading ? (
                        <>
                          <div className="px-2 text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                            {t('user')}
                          </div>
                          <NavLink to={`/profile/${profile?.id || session.user?.id}`} className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}>
                            <User className="h-5 w-5" />
                            {t('profile')}
                          </NavLink>
                          <NavLink to="/requests" className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}>
                            <MailQuestion className="h-5 w-5" />
                            {t('my_requests')}
                          </NavLink>

                          {/* Outils admin mobile */}
                          {profile?.role === 'admin' && (
                            <>
                              <div className="border-t border-border/50 my-4" />
                              <div className="px-2 text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                                {t('admin')}
                              </div>
                              <NavLink to="/admin" className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}>
                                <LayoutDashboard className="h-5 w-5" />
                                {t('admin_dashboard')}
                              </NavLink>
                              <NavLink to="/requests/manage" className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}>
                                <MailQuestion className="h-5 w-5" />
                                {t('requests')}
                              </NavLink>
                            </>
                          )}
                        </>
                      ) : (
                        <NavLink to="/login" state={{ from: location }} className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}>
                          {t('login')}
                        </NavLink>
                      )}
                    </div>

                    {/* Footer du menu mobile */}
                    <div className="px-4 pb-6">
                      {session && !sessionLoading ? (
                        <Button 
                          onClick={() => { setIsSheetOpen(false); handleLogoutClick(); }} 
                          variant="destructive" 
                          className="w-full"
                        >
                          <LogOut className="mr-3 h-5 w-5" />
                          {t('logout')}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Dialog de confirmation de déconnexion */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent className="bg-background border-border">
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

      {/* Dialog de confirmation de don */}
      <AlertDialog open={isDonateDialogOpen} onOpenChange={setIsDonateDialogOpen}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_donation_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_donation_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDonate}
              className="bg-gradient-to-r from-[#FF5E5B] to-[#FF0080] hover:from-[#E54E4B] hover:to-[#E60073] text-white border-[#FF5E5B] shadow-lg"
            >
              {t('continue_to_donation')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Navbar;