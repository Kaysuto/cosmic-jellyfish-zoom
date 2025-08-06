import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, LayoutDashboard, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { getGravatarURL } from "@/lib/gravatar";

const Navbar = () => {
  const { t } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { session } = useSession();
  const { profile } = useProfile();

  const navItems = [
    { to: "/", label: t('home') },
    { to: "/status", label: t('status') },
  ];

  const desktopNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "px-4 py-1.5 text-sm font-medium transition-all duration-200 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      isActive
        ? "bg-gray-700/50 text-white shadow-inner"
        : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
    );

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center w-full text-left px-4 py-3 text-lg font-medium transition-colors duration-200 rounded-md",
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-700"
    );

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(desktopNavLinkClasses({ isActive: false }), "flex items-center gap-2")}>
          <Avatar className="h-6 w-6">
            <AvatarImage src={profile?.avatar_url || getGravatarURL(profile?.email)} alt={profile?.first_name || 'Avatar'} />
            <AvatarFallback>{profile?.first_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <span className="text-white hidden sm:inline">
            Bonjour, {profile?.first_name || 'Admin'}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.first_name} {profile?.last_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link to="/admin"><LayoutDashboard className="mr-2 h-4 w-4" /><span>{t('admin_dashboard')}</span></Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/admin/profile"><User className="mr-2 h-4 w-4" /><span>Profil</span></Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/admin/settings"><Settings className="mr-2 h-4 w-4" /><span>{t('settings')}</span></Link></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const AuthLinks = () => {
    if (session && profile) {
      return <UserMenu />;
    }
    return (
      <NavLink to="/login" className={desktopNavLinkClasses}>
        {t('login')}
      </NavLink>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/60 backdrop-blur-lg border-b border-white/10">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex-1 flex justify-start">
          {/* Potentiel logo ici */}
        </div>
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700/60 rounded-full p-1 shadow-md">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={desktopNavLinkClasses}>
                {item.label}
              </NavLink>
            ))}
            <div className="border-l border-gray-700 h-6 mx-1"></div>
            <AuthLinks />
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-gray-900 border-l-gray-800 w-[280px]">
                <div className="flex flex-col h-full">
                  <div className="flex-grow space-y-2 pt-10">
                    {navItems.map((item) => (
                      <NavLink key={item.to} to={item.to} className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}>
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                  <div className="flex-shrink-0 border-t border-gray-700 pt-4 pb-6">
                    {session && profile ? (
                      <div className="space-y-2">
                        <div className="px-4">
                          <p className="font-medium text-white">{profile.first_name} {profile.last_name}</p>
                          <p className="text-sm text-gray-400">{profile.email}</p>
                        </div>
                        <NavLink to="/admin" className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}><LayoutDashboard className="mr-3 h-5 w-5" />{t('admin_dashboard')}</NavLink>
                        <NavLink to="/admin/profile" className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}><User className="mr-3 h-5 w-5" />Profil</NavLink>
                        <NavLink to="/admin/settings" className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}><Settings className="mr-3 h-5 w-5" />{t('settings')}</NavLink>
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
  );
};

export default Navbar;