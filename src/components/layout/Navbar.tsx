import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { t } = useTranslation();

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      "px-4 py-1.5 text-sm font-medium transition-all duration-200 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      isActive
        ? "bg-gray-700/50 text-white shadow-inner"
        : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
    );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/60 backdrop-blur-lg border-b border-white/10">
      <nav className="container mx-auto px-4 h-16 flex items-center">
        {/* Côté gauche : Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Jelly</span>
          </Link>
        </div>

        {/* Centre : Liens de navigation */}
        <div className="flex-none">
          <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700/60 rounded-full p-1 shadow-md">
            <NavLink to="/" className={navLinkClasses}>
              {t('home')}
            </NavLink>
            <NavLink to="/status" className={navLinkClasses}>
              {t('status')}
            </NavLink>
          </div>
        </div>

        {/* Côté droit : Espaceur pour équilibrer le logo */}
        <div className="flex-1 flex justify-end">
          {/* D'autres éléments pourront être ajoutés ici à l'avenir */}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;