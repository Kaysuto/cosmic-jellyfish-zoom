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
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      iconColor: 'text-green-400'
    },
    degraded: { 
      label: t('degraded'), 
      variant: 'secondary',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      iconColor: 'text-yellow-400'
    },
    downtime: { 
      label: t('downtime'), 
      variant: 'destructive',
      icon: <XCircle className="h-5 w-5" />,
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
      iconColor: 'text-red-400'
    },
  };

  const config = statusConfig[status];

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-medium text-white">{name}</CardTitle>
        <Badge className={`px-3 py-1 text-xs font-medium rounded-full border ${config.color}`}>
          <span className="flex items-center gap-1">
            {config.icon}
            {config.label}
          </span>
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-400 mb-4">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">{t('uptime')} {uptime}%</span>
          <div className="w-24 bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                status === 'operational' ? 'bg-green-500' : 
                status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
              }`} 
              style={{ width: `${uptime}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceStatus;