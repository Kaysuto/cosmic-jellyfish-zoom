import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, LayoutDashboard, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { getGravatarURL } from "@/lib/gravatar";
import { supabase } from "@/integrations/supabase/client";
import CustomAudioPlayer from "@/components/CustomAudioPlayer";
import { useBodyScrollLockCompensation } from "@/hooks/useBodyScrollLockCompensation";

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { session } = useSession();
  const { profile } = useProfile();
  
  const [discordOnline, setDiscordOnline] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  
  useBodyScrollLockCompensation(headerRef);

  useEffect(() => {
    const fetchDiscordCount = async () => {
      try {
        const response = await fetch('https://discord.com/api/guilds/1027968386640117770/widget.json');
        const data = await response.json();
        if (data.members) {
          const onlineUsers = data.members.filter((member: { bot: boolean }) => !member.bot);
          setDiscordOnline(onlineUsers.length);
        }
      } catch (error) {
        console.error("Failed to fetch Discord presence count:", error);
      }
    };

    fetchDiscordCount();
    const interval = setInterval(fetchDiscordCount, 60000);

    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: "/", label: t('home') },
    { to: "/status", label: t('status') },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const desktopNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "px-4 py-1.5 text-sm font-medium transition-all duration-200 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white",
      isActive && "bg-gray-200/80 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-inner"
    );

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center w-full text-left px-4 py-3 text-lg font-medium transition-colors duration-200 rounded-md",
      "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
      isActive && "bg-blue-600 text-white"
    );

  const UserMenu = () => (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button className={cn(desktopNavLinkClasses({ isActive: false }), "flex items-center gap-2")}>
          <Avatar className="h-6 w-6">
            <AvatarImage src={profile?.avatar_url || getGravatarURL(profile?.email)} alt={profile?.first_name || 'Avatar'} />
            <AvatarFallback>{profile?.first_name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <span className="text-foreground hidden sm:inline">
            Bonjour, {profile?.first_name || 'Admin'}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:inline transition-transform duration-200" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-56 p-2 rounded-xl shadow-2xl border backdrop-blur-lg bg-card/80"
        align="end"
      >
        <div className="font-normal px-2 py-1.5">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">{profile?.first_name} {profile?.last_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
          </div>
        </div>
        <div className="my-2 h-px bg-border" />
        <Link to="/admin" className="flex items-center w-full text-left p-2 rounded-md text-sm text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
          <LayoutDashboard className="mr-2 h-4 w-4" /><span>{t('admin_dashboard')}</span>
        </Link>
        <Link to="/admin/profile" className="flex items-center w-full text-left p-2 rounded-md text-sm text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
          <User className="mr-2 h-4 w-4" /><span>Profil</span>
        </Link>
        <Link to="/admin/settings" className="flex items-center w-full text-left p-2 rounded-md text-sm text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
          <Settings className="mr-2 h-4 w-4" /><span>{t('settings')}</span>
        </Link>
        <div className="my-2 h-px bg-border" />
        <button onClick={handleLogout} className="flex items-center w-full text-left p-2 rounded-md text-sm text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('logout')}</span>
        </button>
      </HoverCardContent>
    </HoverCard>
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
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-lg border-b">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex-1 flex justify-start items-center gap-4">
          <CustomAudioPlayer />
        </div>

        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center gap-2 bg-muted/50 border rounded-full p-1 shadow-md">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={desktopNavLinkClasses}>
                {item.label}
              </NavLink>
            ))}
            <div className="border-l h-6 mx-1"></div>
            <AuthLinks />
          </div>
        </div>

        <div className="flex-1 flex justify-end items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:flex items-center gap-2 bg-muted/30 hover:bg-muted/50 rounded-full px-3 py-1.5"
            onClick={() => window.open('https://ptb.discord.com/channels/1027968386640117770/1234313061993676860', '_blank')}
          >
            <div className="relative">
              <svg className="h-4 w-4 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-.99 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.81 2-1.8 2zm6.97 0c-.99 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.81 2-1.8 2z"/>
              </svg>
              <span className="absolute -top-1 -right-1 bg-green-500 rounded-full h-2 w-2"></span>
            </div>
            <span className="text-xs font-medium text-muted-foreground">{t('discord_online', { count: discordOnline })}</span>
          </Button>

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
                  </div>
                  <div className="flex-shrink-0 border-t pt-4 pb-6">
                    {session && profile ? (
                      <div className="space-y-2">
                        <div className="px-4">
                          <p className="font-medium text-foreground">{profile.first_name} {profile.last_name}</p>
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
                        </div>
                        <NavLink to="/admin" className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}><LayoutDashboard className="mr-3 h-5 w-5" />{t('admin_dashboard')}</NavLink>
                        <NavLink to="/admin/profile" className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}><User className="mr-3 h-5 w-5" />Profil</NavLink>
                        <NavLink to="/admin/settings" className={mobileNavLinkClasses} onClick={() => setIsSheetOpen(false)}><Settings className="mr-3 h-5 w-5" />{t('settings')}</NavLink>
                        <div className="px-4 pt-2">
                          <Button onClick={handleLogout} variant="destructive" className="w-full justify-start">
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
  );
};

export default Navbar;