import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Heart, Languages } from 'lucide-react';

export const MadeWithDyad = () => {
  const { t, i18n } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };
  
  return (
    <div className="p-6 text-center flex flex-col items-center gap-3">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleLanguage}
        className="rounded-full bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 text-gray-300"
      >
        <Languages className="h-4 w-4 mr-2" />
        {i18n.language === 'fr' ? 'English' : 'Français'}
      </Button>
      
      <div className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
        <span>{t('made_with_love')}</span>
        <Heart className="h-4 w-4 text-red-500 fill-current" />
        <span>{t('by_kaysuto')}</span>
      </div>
    </div>
  );
};