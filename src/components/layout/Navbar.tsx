import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { t } = useTranslation();

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "text-sm font-medium text-gray-400 hover:text-white transition-colors",
      isActive && "text-white"
    );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/60 backdrop-blur-lg border-b border-white/10">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <Monitor className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Jelly</span>
        </Link>
        <div className="flex items-center gap-8">
          <NavLink to="/" className={navLinkClasses}>
            {t('home')}
          </NavLink>
          <NavLink to="/status" className={navLinkClasses}>
            {t('status')}
          </NavLink>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;