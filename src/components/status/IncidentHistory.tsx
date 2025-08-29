import { useIncidents } from '@/hooks/useIncidents';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Incident } from '@/types/status';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, CheckCircle, Wrench, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAdmins } from '@/hooks/useAdmins';
import { getGravatarURL } from '@/lib/gravatar';

const statusConfig = {
  investigating: { icon: AlertTriangle, color: 'text-yellow-500', labelKey: 'investigating' },
  identified: { icon: Info, color: 'text-orange-500', labelKey: 'identified' },
  monitoring: { icon: Wrench, color: 'text-blue-500', labelKey: 'monitoring' },
  resolved: { icon: CheckCircle, color: 'text-green-500', labelKey: 'resolved' },
};


const IncidentItem = ({ incident }: { incident: Incident }) => {
  const { t } = useSafeTranslation();
  const { admins } = useAdmins();
  const lastUpdate = incident.incident_updates?.[0];
  const config = statusConfig[incident.status] || statusConfig.investigating;
  const author = admins.find(a => a.id === incident.author_id);

  return (
    <Card className="mb-4 bg-muted border border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 mt-1">
            <AvatarImage src={author?.avatar_url || getGravatarURL(author?.email)} alt={author?.first_name || author?.email || 'Utilisateur'} />
            <AvatarFallback>{(author?.first_name?.[0] || author?.email?.[0] || 'U').toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <config.icon className={`h-5 w-5 ${config.color}`} />
                <h3 className="font-semibold text-lg text-foreground">{incident.title}</h3>
              </div>
              <Badge variant="outline">{t(config.labelKey)}</Badge>
            </div>
            {lastUpdate && (
              <div className="mb-1">
                <p className="text-sm text-muted-foreground">
                  {t('updated')} {formatDistanceToNow(new Date(lastUpdate.created_at), { addSuffix: true, locale: fr })}
                </p>
                <p className="text-sm text-foreground mt-1">{lastUpdate.message}</p>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">{author ? (author.first_name || author.email || author.id) : 'Utilisateur'}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{format(new Date(incident.created_at), 'd MMMM yyyy, HH:mm', { locale: fr })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const IncidentHistory = () => {
  const { incidents, loading } = useIncidents();
  const { t } = useSafeTranslation();

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      {incidents.length > 0 ? (
        incidents.map(incident => <IncidentItem key={incident.id} incident={incident} />)
      ) : (
        <p className="text-muted-foreground">{t('no_incidents')}</p>
      )}
    </div>
  );
};

export default IncidentHistory;