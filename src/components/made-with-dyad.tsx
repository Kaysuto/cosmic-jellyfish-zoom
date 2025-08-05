import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const MadeWithDyad = () => {
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
            className="rounded-full bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 text-gray-300"
          >
            <span className="mr-2">{i18n.language === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
            {i18n.language === 'fr' ? 'Français' : 'English'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
          <DropdownMenuItem onClick={() => changeLanguage('fr')} className="focus:bg-gray-700 cursor-pointer">
            <span className="mr-2">🇫🇷</span>
            Français
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => changeLanguage('en')} className="focus:bg-gray-700 cursor-pointer">
            <span className="mr-2">🇬🇧</span>
            English
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
        <span>{t('made_with_love')}</span>
        <Heart className="h-4 w-4 text-red-500 fill-current" />
        <span>{t('by_kaysuto')}</span>
      </div>
    </div>
  );
};