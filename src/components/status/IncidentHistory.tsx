import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  status: 'resolved' | 'investigating' | 'monitoring';
  createdAt: string;
  updatedAt: string;
  description: string;
}

interface IncidentHistoryProps {
  incidents: Incident[];
}

const IncidentHistory: React.FC<IncidentHistoryProps> = ({ incidents }) => {
  const statusConfig = {
    resolved: { label: 'Resolved', variant: 'default' },
    investigating: { label: 'Investigating', variant: 'secondary' },
    monitoring: { label: 'Monitoring', variant: 'secondary' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Incident History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {incidents.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No incidents reported in the past 90 days.</p>
          ) : (
            incidents.map((incident) => {
              const config = statusConfig[incident.status];
              return (
                <div key={incident.id} className="border-l-2 border-gray-200 pl-4 py-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{incident.title}</h3>
                    <Badge variant={config.variant === 'default' ? 'default' : 'secondary'}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(incident.createdAt).toLocaleString()}
                    </span>
                    {incident.updatedAt !== incident.createdAt && (
                      <span className="text-xs text-gray-500">
                        Updated: {new Date(incident.updatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IncidentHistory;