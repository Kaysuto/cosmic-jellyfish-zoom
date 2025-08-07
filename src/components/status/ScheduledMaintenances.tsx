import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Maintenance } from '@/hooks/useMaintenances';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <Card className="bg-blue-900/30 border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-white">
          <Wrench className="h-5 w-5 text-blue-400" />
          {t('scheduled_maintenance')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-48 pr-4">
          <div className="space-y-4">
            {upcomingMaintenances.map(m => (
              <div key={m.id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <h4 className="font-semibold text-white">{m.title}</h4>
                <p className="text-sm text-gray-400 mt-1">{m.description}</p>
                <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-700/50 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>
                    {format(new Date(m.start_time), 'd MMM, HH:mm', { locale: currentLocale })} - {format(new Date(m.end_time), 'HH:mm', { locale: currentLocale })}
                  </span>
                </div>
                 {m.services && (
                  <p className="text-xs text-blue-400 mt-2">
                    {t('Service')}: {t(m.services.name.toLowerCase().replace(/ /g, '_'))}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ScheduledMaintenances;