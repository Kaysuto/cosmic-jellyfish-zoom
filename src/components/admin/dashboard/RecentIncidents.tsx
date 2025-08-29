import { useIncidents } from '@/hooks/useIncidents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IncidentStatus } from '@/types/status';

const statusConfig: Record<IncidentStatus, { labelKey: string; color: string; icon: React.ElementType }> = {
  investigating: { labelKey: 'investigating', color: 'bg-yellow-500', icon: AlertTriangle },
  identified: { labelKey: 'identified', color: 'bg-orange-500', icon: AlertTriangle },
  monitoring: { labelKey: 'monitoring', color: 'bg-blue-500', icon: Wrench },
  resolved: { labelKey: 'resolved', color: 'bg-green-500', icon: CheckCircle },
};

const RecentIncidents = () => {
  const { incidents, loading } = useIncidents();
  const { t } = useSafeTranslation();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('active_incidents')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentIncidents = incidents.slice(0, 5);
  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('active_incidents')}</CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{activeIncidents}</div>
        <p className="text-xs text-muted-foreground">
          {t('incident_count_fr', { count: activeIncidents, ns: 'translation' })}
        </p>
        <div className="mt-4 space-y-4">
          {recentIncidents.length > 0 ? (
            recentIncidents.map(incident => {
              const config = statusConfig[incident.status as IncidentStatus] || statusConfig.investigating;
              return (
                <div key={incident.id} className="flex items-start space-x-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="relative flex h-5 w-5 items-center justify-center">
                          <div className={cn("h-3 w-3 rounded-full", config.color)} />
                          {incident.status !== 'resolved' && (
                            <div className="absolute inset-0 h-3 w-3 rounded-full bg-current animate-ping opacity-20" />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t(config.labelKey)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex-1">
                    <Link to={`/admin/incidents/edit/${incident.id}`} className="font-medium hover:underline">
                      {incident.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {new Date(incident.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">{incident.service?.name || t('system_wide_incident')}</Badge>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">{t('no_incidents')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentIncidents;