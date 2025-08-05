import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface StatusHeaderProps {
  overallStatus: 'operational' | 'degraded' | 'downtime';
}

const StatusHeader: React.FC<StatusHeaderProps> = ({ overallStatus }) => {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleString());
  
  // Mettre à jour l'heure toutes les secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    
    // Nettoyer l'intervalle quand le composant est démonté
    return () => clearInterval(timer);
  }, []);
  
  const statusConfig = {
    operational: { 
      label: t('all_systems_operational'), 
      variant: 'default',
      color: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    degraded: { 
      label: t('partial_outage'), 
      variant: 'destructive',
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    },
    downtime: { 
      label: t('major_outage'), 
      variant: 'destructive',
      color: 'bg-red-500/20 text-red-400 border-red-500/30'
    },
  };

  const config = statusConfig[overallStatus];

  return (
    <div className="w-full py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          {t('status_title')}
        </h1>
        <div className="flex justify-center">
          <Badge className={`px-4 py-2 text-sm font-medium rounded-full border ${config.color}`}>
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-gray-400 mt-3">{t('last_updated')} {currentTime}</p>
      </div>
      
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
        <CardContent className="p-6">
          <p className="text-center text-gray-300 mb-6">
            {overallStatus === 'operational' 
              ? t('all_systems_operational_description')
              : t('systems_issues_description')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="https://playjelly.fr" target="_blank" rel="noopener noreferrer" className="block text-center p-4 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl border border-green-800/30 hover:border-green-600/50 transition-all duration-300">
              <h3 className="font-semibold text-green-300">playjelly.fr</h3>
              <p className="text-sm text-gray-400 mt-1">{t('streaming_service')}</p>
            </a>
            <a href="https://accounts.playjelly.fr" target="_blank" rel="noopener noreferrer" className="block text-center p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl border border-blue-800/30 hover:border-blue-600/50 transition-all duration-300">
              <h3 className="font-semibold text-blue-300">accounts.playjelly.fr</h3>
              <p className="text-sm text-gray-400 mt-1">{t('accounts_service')}</p>
            </a>
            <a href="https://vod.playjelly.fr" target="_blank" rel="noopener noreferrer" className="block text-center p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl border border-purple-800/30 hover:border-purple-600/50 transition-all duration-300">
              <h3 className="font-semibold text-purple-300">vod.playjelly.fr</h3>
              <p className="text-sm text-gray-400 mt-1">{t('vod_service')}</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusHeader;