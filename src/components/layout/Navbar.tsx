import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, LayoutDashboard, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { getGravatarURL } from "@/lib/gravatar";
import { supabase } from "@/integrations/supabase/client";
import { useBodyScrollLockCompensation } from "@/hooks/useBodyScrollLockCompensation";
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

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { session } = useSession();
  const { profile } = useProfile();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  
  const headerRef = useRef<HTMLElement>(null);
  
  useBodyScrollLockCompensation(headerRef);

  const navItems = [
    { to: "/", label: t('home') },
    { to: "/status", label: t('status') },
  ];

  const protectedNavItems = [
    { to: "/requests", label: t('requests') },
  ];

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    if (session?.user) {
      await supabase.from('audit_logs').insert({
        user_id: session.user.id,
        action: 'user_logout',
        details: { email: session.user.email }
      });
    }
    await supabase.auth.signOut();
    navigate('/');
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "px-3 py-1.5 text-sm font-medium transition-colors duration-200 rounded-md",
      "text-gray-400 hover:bg-gray-800/50 hover:text-white",
      isActive && "bg-gray-700/50 text-white"
    );

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center w-full text-left px-4 py-3 text-lg font-medium transition-colors duration-200 rounded-md",
      "text-gray-300 hover:bg-gray-700",
      isActive && "bg-blue-600 text-white"
    );

  const UserMenu = () => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 group px-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={profile?.avatar_url || getGravatarURL(profile?.email)} alt={profile?.first_name || 'Avatar'} />
            <AvatarFallback>{profile?.first_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <span className="text-white hidden sm:inline text-sm font-medium">
            {profile?.first_name || 'Admin'}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:inline transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.first_name} {profile?.last_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profile?.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>{t('admin_dashboard')}</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        {profile?.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link to="/admin/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('settings')}</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogoutClick} className="text-destructive focus:text-destructive cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-lg border-b">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Jelly Logo" className="h-8 w-auto" />
            </Link>
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClasses}>
                  {item.label}
                </NavLink>
              ))}
              {session && protectedNavItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClasses}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session && profile ? <UserMenu /> : (
              <Button asChild variant="ghost" className="hidden md:inline-flex">
                <Link to="/login">{t('login')}</Link>
              </Button>
            )}
            <div className="md:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background border-l w-[280px]">
                  <div className="flex flex-col h-full">
                    <div className="flex-grow space-y-2 pt-10">
                      {navItems.map((item) => (
                        <NavLink key={item.to} to={item.to} className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}>
                          {item.label}
                        </NavLink>
                      ))}
                      {session && protectedNavItems.map((item) => (
                        <NavLink key={item.to} to={item.to} className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}>
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                    <div className="flex-shrink-0 border-t pt-4 pb-6">
                      {session && profile ? (
                        <div className="space-y-2">
                          <div className="px-4">
                            <p className="font-medium text-foreground">{profile.first_name} {profile.last_name}</p>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                          </div>
                          {profile.role === 'admin' && (
                            <>
                              <NavLink to="/admin" className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}><LayoutDashboard className="mr-3 h-5 w-5" />{t('admin_dashboard')}</NavLink>
                              <NavLink to="/admin/settings" className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}><Settings className="mr-3 h-5 w-5" />{t('settings')}</NavLink>
                            </>
                          )}
                          <NavLink to="/profile" className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}><User className="mr-3 h-5 w-5" />Profil</NavLink>
                          <div className="px-4 pt-2">
                            <Button onClick={handleLogoutClick} variant="destructive" className="w-full justify-start">
                              <LogOut className="mr-3 h-5 w-5" />
                              {t('logout')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <NavLink to="/login" className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}>
                          {t('login')}
                        </NavLink>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>
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
    </>
  );
};

export default Navbar;