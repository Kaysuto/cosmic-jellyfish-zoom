import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface StatusHeaderProps {
  overallStatus: 'operational' | 'degraded' | 'downtime';
  lastUpdated: string;
}

const StatusHeader: React.FC<StatusHeaderProps> = ({ overallStatus, lastUpdated }) => {
  const statusConfig = {
    operational: { label: 'All Systems Operational', variant: 'default' },
    degraded: { label: 'Partial System Outage', variant: 'destructive' },
    downtime: { label: 'Major System Outage', variant: 'destructive' },
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
        <p className="text-sm text-gray-500 mt-2">Last updated: {lastUpdated}</p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-700">
            This page shows the current status of all PlayJelly services. 
            If you're experiencing issues, please check this page for updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusHeader;