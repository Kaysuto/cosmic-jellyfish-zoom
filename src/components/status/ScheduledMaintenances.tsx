import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Maintenance } from '@/hooks/useMaintenances';

interface ScheduledMaintenancesProps {
  maintenances: Maintenance[];
}

const ScheduledMaintenances = ({ maintenances }: ScheduledMaintenancesProps) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const upcomingMaintenances = maintenances.filter(m => new Date(m.end_time) > new Date());

  if (upcomingMaintenances.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-card-foreground">
          <Wrench className="h-5 w-5 text-primary" />
          {t('scheduled_maintenance')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingMaintenances.map(m => (
          <div key={m.id} className="p-4 rounded-lg bg-muted border border-border">
            <h4 className="font-semibold text-foreground">{m.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
            <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>
                {format(new Date(m.start_time), 'd MMM, HH:mm', { locale: currentLocale })} - {format(new Date(m.end_time), 'HH:mm', { locale: currentLocale })}
              </span>
            </div>
             {m.services && (
              <p className="text-xs text-primary mt-2">
                {t('Service')}: {t(m.services.name.toLowerCase().replace(/ /g, '_'))}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ScheduledMaintenances;