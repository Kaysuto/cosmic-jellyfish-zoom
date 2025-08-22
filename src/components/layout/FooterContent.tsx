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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <img src={logo} alt="Jelly Logo" className="h-8 w-auto mb-2 mx-auto md:mx-0" />
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {t('jelly_brand')}. {t('all_rights_reserved')}</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link to="/status" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('status')}</Link>
          <Link to="/catalog" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('catalog')}</Link>
          <Link to="/about" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('about_us')}</Link>
          <Link to="/privacy" className="text-sm text-muted-foreground hover:text-white transition-colors">{t('privacy_policy')}</Link>
          <Link to="/dmca" className="text-sm text-muted-foreground hover:text-white transition-colors">DMCA</Link>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full"
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
  );
};