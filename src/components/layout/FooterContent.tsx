import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FranceFlag from '@/components/icons/FranceFlag';
import UKFlag from '@/components/icons/UKFlag';
import { Link } from 'react-router-dom';
import logo from '/logo.png';

export const FooterContent = () => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lang: 'fr' | 'en') => {
    i18n.changeLanguage(lang);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo and brand */}
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <img src={logo} alt="Jelly Logo" className="h-8 w-auto" />
            <span className="font-bold text-lg text-white">{t('jelly_brand')}</span>
          </Link>
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {t('jelly_brand')}. {t('all_rights_reserved')}</p>
        </div>

        {/* Links */}
        <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div>
            <h4 className="font-semibold text-white mb-4">{t('navigation')}</h4>
            <ul className="space-y-2">
              <li><Link to="/status" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('status')}</Link></li>
              <li><Link to="/catalog" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('catalog')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">{t('legal')}</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('about_us')}</Link></li>
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('privacy_policy')}</Link></li>
              <li><Link to="/dmca" className="text-sm text-muted-foreground hover:text-white transition-colors">DMCA</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">{t('language')}</h4>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  {i18n.language === 'fr' ? (
                    <FranceFlag className="w-5 h-auto mr-2 rounded-sm" />
                  ) : (
                    <UKFlag className="w-5 h-auto mr-2 rounded-sm" />
                  )}
                  {i18n.language === 'fr' ? 'Français' : 'English'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => changeLanguage('fr')} className="cursor-pointer">
                  <FranceFlag className="w-5 h-auto mr-2 rounded-sm" />
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('en')} className="cursor-pointer">
                  <UKFlag className="w-5 h-auto mr-2 rounded-sm" />
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="mt-12 border-t border-gray-800 pt-8 text-center text-xs text-muted-foreground">
        <p>{t('disclaimer')}</p>
      </div>
    </div>
  );
};