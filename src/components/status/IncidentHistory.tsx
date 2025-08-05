import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Incident as ApiIncident } from '@/hooks/useIncidents';

interface Incident {
  id: string;
  title: string;
  status: 'resolved' | 'investigating' | 'monitoring' | 'identified';
  createdAt: string;
  updatedAt: string;
  description: string;
}

interface IncidentHistoryProps {
  incidents: ApiIncident[];
}

const IncidentHistory: React.FC<IncidentHistoryProps> = ({ incidents }) => {
  const { t } = useTranslation();
  
  // Conversion des incidents de l'API vers le format attendu par le composant
  const convertedIncidents: Incident[] = incidents.map(incident => ({
    id: incident.id,
    title: incident.title,
    status: incident.status,
    createdAt: incident.created_at,
    updatedAt: incident.updated_at,
    description: incident.description || ''
  }));
  
  const statusConfig = {
    resolved: { label: t('resolved'), variant: 'default' },
    investigating: { label: t('investigating'), variant: 'secondary' },
    monitoring: { label: t('monitoring'), variant: 'secondary' },
    identified: { label: t('identified'), variant: 'secondary' },
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <AlertCircle className="h-5 w-5" />
          {t('incident_history')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {convertedIncidents.length === 0 ? (
            <p className="text-center text-gray-500 py-4">{t('no_incidents')}</p>
          ) : (
            convertedIncidents.map((incident) => {
              const config = statusConfig[incident.status];
              return (
                <div key={incident.id} className="border-l-2 border-gray-600 pl-4 py-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-white">{incident.title}</h3>
                    <Badge variant={config.variant === 'default' ? 'default' : 'secondary'}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{incident.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(incident.createdAt).toLocaleString()}
                    </span>
                    {incident.updatedAt !== incident.createdAt && (
                      <span className="text-xs text-gray-500">
                        {t('updated')} {new Date(incident.updatedAt).toLocaleString()}
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