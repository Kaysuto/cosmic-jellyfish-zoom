import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ServiceStatusProps {
  name: string;
  status: 'operational' | 'degraded' | 'downtime';
  description: string;
  uptime: string;
}

const ServiceStatus: React.FC<ServiceStatusProps> = ({ name, status, description, uptime }) => {
  const { t } = useTranslation();
  
  const statusConfig = {
    operational: { 
      label: t('operational'), 
      variant: 'default',
      icon: <CheckCircle className="h-4 w-4" />
    },
    degraded: { 
      label: t('degraded'), 
      variant: 'secondary',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    downtime: { 
      label: t('downtime'), 
      variant: 'destructive',
      icon: <XCircle className="h-4 w-4" />
    },
  };

  const config = statusConfig[status];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white">{name}</CardTitle>
        <Badge variant={config.variant === 'default' ? 'default' : 'destructive'}>
          <span className="flex items-center gap-1">
            {config.icon}
            {config.label}
          </span>
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-400 mb-2">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">{t('uptime')} {uptime}%</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceStatus;