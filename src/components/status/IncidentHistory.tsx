import { useIncidents } from '@/hooks/useIncidents';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Incident } from '@/types/status';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, CheckCircle, Wrench, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';

const statusConfig = {
  investigating: { icon: AlertTriangle, color: 'text-yellow-500', labelKey: 'investigating' },
  identified: { icon: Info, color: 'text-orange-500', labelKey: 'identified' },
  monitoring: { icon: Wrench, color: 'text-blue-500', labelKey: 'monitoring' },
  resolved: { icon: CheckCircle, color: 'text-green-500', labelKey: 'resolved' },
};

const IncidentItem = ({ incident }: { incident: Incident }) => {
  const { t } = useSafeTranslation();
  const lastUpdate = incident.incident_updates?.[0];
  const config = statusConfig[incident.status] || statusConfig.investigating;

  return (
    <div className="mb-8">
      <div className="flex items-center mb-2">
        <config.icon className={`h-5 w-5 mr-2 ${config.color}`} />
        <h3 className="font-semibold text-lg">{incident.title}</h3>
        <Badge variant="outline" className="ml-auto">{t(config.labelKey)}</Badge>
      </div>
      
      {lastUpdate && (
        <div className="pl-7">
          <p className="text-sm text-muted-foreground mb-2">
            {t('updated')} {formatDistanceToNow(new Date(lastUpdate.created_at), { addSuffix: true, locale: fr })}
          </p>
          <p className="text-sm">{lastUpdate.message}</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-2 pl-7">
        {format(new Date(incident.created_at), 'd MMMM yyyy, HH:mm', { locale: fr })}
      </p>
    </div>
  );
};

const IncidentHistory = () => {
  const { incidents, loading } = useIncidents();
  const { t } = useSafeTranslation();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('incident_history')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('incident_history')}</h2>
      {incidents.length > 0 ? (
        incidents.map(incident => <IncidentItem key={incident.id} incident={incident} />)
      ) : (
        <p className="text-muted-foreground">{t('no_incidents')}</p>
      )}
    </div>
  );
};

export default IncidentHistory;