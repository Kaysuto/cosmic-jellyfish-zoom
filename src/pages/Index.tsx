import React from 'react';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Bienvenue sur Notre Plateforme</h1>
          <p className="text-gray-400">Votre destination pour des services en ligne fiables et performants.</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-blue-300">{t('Notre Mission')}</h2>
          <p className="text-gray-300">
            {t('Nous nous engageons à fournir une plateforme fiable et performante pour vos expériences numériques.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;