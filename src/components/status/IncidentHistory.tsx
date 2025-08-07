import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ShieldAlert, Eye, Wrench, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Incident as ApiIncident } from '@/hooks/useIncidents';
import { format, formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getGravatarURL } from '@/lib/gravatar';

interface IncidentHistoryProps {
  incidents: ApiIncident[];
}

const statusConfigMap = (t: (key: string) => string) => ({
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
});

const IncidentItem = ({ incident }: { incident: ApiIncident }) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;
  const statusConfig = statusConfigMap(t)[incident.status];
  const authorName = incident.profiles?.first_name || t('system_update');
  const authorInitial = authorName.charAt(0).toUpperCase();

  const isFrench = i18n.language === 'fr';
  const title = (isFrench || !incident.title_en) ? incident.title : incident.title_en;
  const description = (isFrench || !incident.description_en) ? incident.description : incident.description_en;

  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2 gap-2">
          <div className="flex-grow">
            <h4 className="font-medium text-white">{title}</h4>
            {incident.services?.name && (
              <p className="text-xs text-gray-400 mt-1">
                {t('Service')}: {t(incident.services.name.toLowerCase().replace(/ /g, '_'))}
              </p>
            )}
          </div>
          <Badge className={cn("px-3 py-1 text-xs font-medium rounded-full border shrink-0", statusConfig.className)}>
            <statusConfig.Icon className="h-3 w-3 mr-1.5" />
            {statusConfig.label}
          </Badge>
        </div>
        <p className="text-sm text-gray-400 mb-3">{description}</p>
      </div>
      <div className="text-xs text-gray-500 border-t border-gray-700/50 pt-3 mt-3 flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-400 mb-1">{format(new Date(incident.created_at), 'd MMMM yyyy, HH:mm', { locale: currentLocale })}</p>
          {incident.updated_at !== incident.created_at && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t('updated')} {formatDistanceToNow(new Date(incident.updated_at), { addSuffix: true, locale: currentLocale })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2" title={`Posté par ${authorName}`}>
          <span className="text-gray-400 text-right">{authorName}</span>
          <Avatar className="h-6 w-6">
            <AvatarImage src={incident.profiles?.avatar_url || getGravatarURL(incident.profiles?.email, 24)} />
            <AvatarFallback>{authorInitial}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};

const IncidentHistory: React.FC<IncidentHistoryProps> = ({ incidents }) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const INCIDENTS_PER_PAGE = 3;

  const totalPages = Math.ceil(incidents.length / INCIDENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * INCIDENTS_PER_PAGE;
  const currentIncidents = incidents.slice(startIndex, startIndex + INCIDENTS_PER_PAGE);

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl flex flex-col h-full">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-xl text-white">
          <AlertCircle className="h-5 w-5 text-red-400" />
          {t('incident_history')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-start overflow-y-auto py-4">
        {incidents.length === 0 ? (
          <div className="text-center py-8 flex flex-col items-center justify-center h-full">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-gray-400">{t('no_incidents')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentIncidents.map(incident => (
              <IncidentItem key={incident.id} incident={incident} />
            ))}
          </div>
        )}
      </CardContent>
      {incidents.length > INCIDENTS_PER_PAGE && (
        <div className="flex-shrink-0 flex items-center justify-between w-full gap-2 text-white p-4 border-t border-gray-700/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className="bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('previous')}
          </Button>
          <span className="text-sm text-gray-400 font-mono">
            {t('page')} {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
            className="bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 disabled:opacity-50"
          >
            {t('next')}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </Card>
  );
};

export default IncidentHistory;