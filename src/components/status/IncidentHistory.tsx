import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Incident as ApiIncident } from '@/hooks/useIncidents';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  
  const convertedIncidents: Incident[] = incidents.map(incident => ({
    id: incident.id,
    title: incident.title,
    status: incident.status,
    createdAt: incident.created_at,
    updatedAt: incident.updated_at,
    description: incident.description || ''
  }));
  
  const statusConfig = {
    resolved: { 
      label: t('resolved'), 
      variant: 'default',
      color: 'bg-green-500/10 text-green-500 border-green-500/20'
    },
    investigating: { 
      label: t('investigating'), 
      variant: 'secondary',
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    },
    monitoring: { 
      label: t('monitoring'), 
      variant: 'secondary',
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    },
    identified: { 
      label: t('identified'), 
      variant: 'secondary',
      color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    },
  };

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-white">
          <AlertCircle className="h-5 w-5 text-red-400" />
          {t('incident_history')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {convertedIncidents.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center justify-center h-full">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-green-400" />
                </div>
                <p className="text-gray-400">{t('no_incidents')}</p>
              </div>
            ) : (
              convertedIncidents.map((incident) => {
                const config = statusConfig[incident.status];
                return (
                  <div key={incident.id} className="border-l-2 border-gray-600 pl-4 py-3 hover:bg-gray-700/30 rounded-r-lg transition-all duration-200">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-white">{incident.title}</h3>
                      <Badge className={`px-3 py-1 text-xs font-medium rounded-full border ${config.color}`}>
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{incident.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(incident.createdAt).toLocaleString()}
                      </div>
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
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default IncidentHistory;