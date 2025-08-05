import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export const MadeWithDyad = () => {
  const { t, i18n } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };
  
  return (
    <div className="p-4 text-center flex flex-col items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleLanguage}
        className="rounded-full"
      >
        {i18n.language === 'fr' ? 'English' : 'Français'}
      </Button>
      
      <div className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1">
        <span>Créé avec</span>
        <Heart className="h-4 w-4 text-red-500 fill-current" />
        <span>par Kaysuto Kimiya</span>
      </div>
    </div>
  );
};