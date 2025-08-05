import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface StatusHeaderProps {
  overallStatus: 'operational' | 'degraded' | 'downtime';
  lastUpdated: string;
}

const StatusHeader: React.FC<StatusHeaderProps> = ({ overallStatus, lastUpdated }) => {
  const { t } = useTranslation();
  
  const statusConfig = {
    operational: { label: t('all_systems_operational'), variant: 'default' },
    degraded: { label: t('partial_outage'), variant: 'destructive' },
    downtime: { label: t('major_outage'), variant: 'destructive' },
  };

  const config = statusConfig[overallStatus];

  return (
    <div className="w-full py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">PlayJelly Status</h1>
        <div className="flex justify-center">
          <Badge variant={config.variant === 'default' ? 'default' : 'destructive'}>
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 mt-2">{t('last_updated')} {lastUpdated}</p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-700">
            {overallStatus === 'operational' 
              ? t('all_systems_operational_description')
              : t('systems_issues_description')}
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <h3 className="font-semibold">playjelly.fr</h3>
              <p className="text-sm text-gray-600">{t('streaming_service')}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <h3 className="font-semibold">accounts.playjelly.fr</h3>
              <p className="text-sm text-gray-600">{t('accounts_service')}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <h3 className="font-semibold">vod.playjelly.fr</h3>
              <p className="text-sm text-gray-600">{t('vod_service')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusHeader;