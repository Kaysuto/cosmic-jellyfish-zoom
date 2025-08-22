import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useServices } from '@/hooks/useServices';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const ServicesOverview = () => {
  const { t } = useTranslation();
  const { services, loading } = useServices();

  const statusIndicatorConfig = {
    operational: { color: 'bg-green-500' },
    degraded: { color: 'bg-yellow-500' },
    downtime: { color: 'bg-red-500' },
    maintenance: { color: 'bg-gray-500' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aperçu des Services</CardTitle>
        <CardDescription>Statut actuel de tous les services.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(services.length || 5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {services.map(service => (
              <div key={service.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                <div className="flex items-center gap-3">
                  <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", statusIndicatorConfig[service.status].color)}></span>
                  <span className="font-medium">{t(service.name.toLowerCase().replace(/ /g, '_'))}</span>
                </div>
                <span className="text-sm text-muted-foreground">{t(service.status)}</span>
              </div>
            ))}
             <Button asChild variant="link" className="p-0 h-auto mt-2">
              <Link to="/admin/services">Gérer les services</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServicesOverview;