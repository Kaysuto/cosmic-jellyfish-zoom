import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const { t } = useTranslation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
      "block w-full text-left px-4 py-3 text-lg font-medium transition-colors duration-200 rounded-md",
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-700"
    );

  const DesktopNav = () => (
    <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700/60 rounded-full p-1 shadow-md">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={desktopNavLinkClasses}
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );

  const MobileNav = () => (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-gray-900 border-l-gray-800 w-[250px] sm:w-[300px]">
        <div className="flex flex-col gap-4 pt-10">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={mobileNavLinkClasses}
              onClick={() => setIsSheetOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/60 backdrop-blur-lg border-b border-white/10">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-end md:justify-center">
        {/* Centre : Liens de navigation (Desktop) */}
        <div className="hidden md:block">
          <DesktopNav />
        </div>

        {/* Côté droit : Menu (Mobile) */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;