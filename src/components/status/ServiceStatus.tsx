import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ServiceStatusProps {
  name: string;
  status: 'operational' | 'degraded' | 'downtime';
  description: string;
  uptime: string;
}

const ServiceStatus: React.FC<ServiceStatusProps> = ({ name, status, description, uptime }) => {
  const statusConfig = {
    operational: { 
      label: 'Operational', 
      variant: 'default',
      icon: <CheckCircle className="h-4 w-4" />
    },
    degraded: { 
      label: 'Degraded Performance', 
      variant: 'secondary',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    downtime: { 
      label: 'Major Outage', 
      variant: 'destructive',
      icon: <XCircle className="h-4 w-4" />
    },
  };

  const config = statusConfig[status];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        <Badge variant={config.variant === 'default' ? 'default' : 'destructive'}>
          <span className="flex items-center gap-1">
            {config.icon}
            {config.label}
          </span>
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-2">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Uptime: {uptime}%</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceStatus;