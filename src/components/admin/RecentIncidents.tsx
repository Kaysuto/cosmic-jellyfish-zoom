import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIncidents } from '@/hooks/useIncidents';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const RecentIncidents = () => {
  const { t, i18n } = useTranslation();
  const { incidents, loading } = useIncidents();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const statusConfig = {
    investigating: { text: t('investigating'), className: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
    identified: { text: t('identified'), className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
    monitoring: { text: t('monitoring'), className: 'bg-purple-500/20 text-purple-500 border-purple-500/30' },
    resolved: { text: t('resolved'), className: 'bg-green-500/20 text-green-500 border-green-500/30' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incidents Récents</CardTitle>
        <CardDescription>Les 5 derniers incidents créés ou mis à jour.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.slice(0, 5).map(incident => (
              <div key={incident.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{incident.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('updated')} {formatDistanceToNow(new Date(incident.updated_at), { addSuffix: true, locale: currentLocale })}
                  </p>
                </div>
                <Badge variant="outline" className={cn('border', statusConfig[incident.status].className)}>
                  {statusConfig[incident.status].text}
                </Badge>
              </div>
            ))}
            <Button asChild variant="link" className="p-0 h-auto">
              <Link to="/admin/incidents">Voir tous les incidents</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentIncidents;