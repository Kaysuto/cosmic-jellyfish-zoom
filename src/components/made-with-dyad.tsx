"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export const MadeWithDyad: React.FC = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLanguage);
  };

  return (
    <div className="p-6 text-center flex flex-col items-center gap-3">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleLanguage}
        className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 text-gray-200"
      >
        <Globe className="w-4 h-4 mr-2" />
        {i18n.language === 'fr' ? 'Switch to English' : 'Passer en français'}
      </Button>
      
      <div className="text-sm text-gray-400">
        Made with <span className="text-blue-400">Dyad</span>
      </div>
    </div>
  );
};