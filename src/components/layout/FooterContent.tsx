import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FranceFlag from '@/components/icons/FranceFlag';
import UKFlag from '@/components/icons/UKFlag';

export const FooterContent = () => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lang: 'fr' | 'en') => {
    i18n.changeLanguage(lang);
  };
  
  return (
    <div className="p-6 flex flex-col items-center justify-center gap-4">
      <DropdownMenu>
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
            {i18n.language === 'fr' ? t('language_fr') : t('language_en')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => changeLanguage('fr')} className="cursor-pointer">
            <FranceFlag className="w-5 h-auto mr-2 rounded-sm" />
            {t('language_fr')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => changeLanguage('en')} className="cursor-pointer">
            <UKFlag className="w-5 h-auto mr-2 rounded-sm" />
            {t('language_en')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
        <span>{t('made_with_love')}</span>
        <Heart className="h-4 w-4 text-red-500 fill-current" />
        <span>{t('by_kaysuto')}</span>
      </div>
    </div>
  );
};