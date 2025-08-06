import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ShieldAlert, Eye, Wrench, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Incident as ApiIncident } from '@/hooks/useIncidents';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface IncidentHistoryProps {
  incidents: ApiIncident[];
}

const INCIDENTS_PER_PAGE = 3;

const IncidentHistory: React.FC<IncidentHistoryProps> = ({ incidents }) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(incidents.length / INCIDENTS_PER_PAGE);

  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * INCIDENTS_PER_PAGE;
    const endIndex = startIndex + INCIDENTS_PER_PAGE;
    return incidents.slice(startIndex, endIndex);
  }, [incidents, currentPage]);
  
  const statusConfig = {
    resolved: { 
      label: t('resolved'), 
      Icon: CheckCircle,
      className: 'text-green-400 border-green-500/30 bg-green-500/10',
    },
    investigating: { 
      label: t('investigating'), 
      Icon: ShieldAlert,
      className: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    },
    monitoring: { 
      label: t('monitoring'), 
      Icon: Eye,
      className: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    },
    identified: { 
      label: t('identified'), 
      Icon: Wrench,
      className: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    },
  };

  const groupedIncidents = useMemo(() => {
    const groups = paginatedIncidents.reduce((acc, incident) => {
      const month = format(new Date(incident.created_at), 'MMMM yyyy', { locale: currentLocale });
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
      if (!acc[capitalizedMonth]) {
        acc[capitalizedMonth] = [];
      }
      acc[capitalizedMonth].push(incident);
      return acc;
    }, {} as Record<string, ApiIncident[]>);
    return Object.entries(groups);
  }, [paginatedIncidents, currentLocale]);

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl flex flex-col h-full">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-xl text-white">
          <AlertCircle className="h-5 w-5 text-red-400" />
          {t('incident_history')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {incidents.length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center justify-center h-full">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-gray-400">{t('no_incidents')}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedIncidents.map(([month, monthIncidents]) => (
                <div key={month}>
                  <h3 className="text-lg font-semibold text-gray-300 mb-4 sticky top-0 bg-gray-800/50 py-2 backdrop-blur-sm">{month}</h3>
                  <div className="relative border-l-2 border-gray-700 ml-3">
                    {monthIncidents.map((incident, index) => {
                      const config = statusConfig[incident.status];
                      return (
                        <div key={incident.id} className="mb-8 pl-8 relative">
                          <div className={cn("absolute -left-[13px] top-1 h-6 w-6 rounded-full flex items-center justify-center", config.className)}>
                            <config.Icon className="h-4 w-4" />
                          </div>
                          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-white">{incident.title}</h4>
                              <Badge className={cn("px-3 py-1 text-xs font-medium rounded-full border", config.className)}>
                                {config.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400 mb-3">{incident.description}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{format(new Date(incident.created_at), 'd MMMM yyyy, HH:mm', { locale: currentLocale })}</span>
                              {incident.updated_at !== incident.created_at && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {t('updated')} {formatDistanceToNow(new Date(incident.updated_at), { addSuffix: true, locale: currentLocale })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex-shrink-0">
          <div className="flex items-center justify-center w-full gap-2 text-white">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              className="bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 disabled:opacity-50"
            >
              Précédent
            </Button>
            <span className="text-sm text-gray-400">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
              className="bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 disabled:opacity-50"
            >
              Suivant
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default IncidentHistory;