import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ShieldAlert, Eye, Wrench, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Incident as ApiIncident } from '@/hooks/useIncidents';
import { format, formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
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
    <div className="bg-card p-4 rounded-lg border flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2 gap-2">
          <div className="flex-grow">
            <h4 className="font-medium text-foreground">{title}</h4>
            {incident.services?.name && (
              <p className="text-xs text-muted-foreground mt-1">
                {t('Service')}: {t(incident.services.name.toLowerCase().replace(/ /g, '_'))}
              </p>
            )}
          </div>
          <Badge className={cn("px-3 py-1 text-xs font-medium rounded-full border shrink-0", statusConfig.className)}>
            <statusConfig.Icon className="h-3 w-3 mr-1.5" />
            {statusConfig.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
      </div>
      <div className="text-xs text-muted-foreground border-t pt-3 mt-3 flex justify-between items-center">
        <div>
          <p className="font-semibold text-foreground mb-1">{format(new Date(incident.created_at), 'd MMMM yyyy, HH:mm', { locale: currentLocale })}</p>
          {incident.updated_at !== incident.created_at && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t('updated')} {formatDistanceToNow(new Date(incident.updated_at), { addSuffix: true, locale: currentLocale })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2" title={`Posté par ${authorName}`}>
          <span className="text-right">{authorName}</span>
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

  if (incidents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t('no_past_incidents')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      {incidents.map(incident => (
        <IncidentItem key={incident.id} incident={incident} />
      ))}
    </div>
  );
};

export default IncidentHistory;