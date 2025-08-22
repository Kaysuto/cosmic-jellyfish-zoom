import { useTranslation } from 'react-i18next';
import { Service } from '@/hooks/useServices';
import { Incident } from '@/hooks/useIncidents';
import { Maintenance } from '@/hooks/useMaintenances';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, XCircle, Wrench, ShieldAlert, Clock } from 'lucide-react';
import ServiceUptimeSparkline from './ServiceUptimeSparkline';
import { format, formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface ServicesStatusProps {
  services: Service[];
  incidents: Incident[];
  maintenances: Maintenance[];
}

const statusConfigMap = (t: (key: string) => string) => ({
  operational: {
    text: t('operational'),
    Icon: CheckCircle,
    className: 'text-green-400',
  },
  degraded: {
    text: t('degraded'),
    Icon: AlertTriangle,
    className: 'text-yellow-400',
  },
  downtime: {
    text: t('downtime'),
    Icon: XCircle,
    className: 'text-red-400',
  },
  maintenance: {
    text: t('maintenance'),
    Icon: Wrench,
    className: 'text-gray-400',
  },
});

const ServicesStatus = ({ services, incidents, maintenances }: ServicesStatusProps) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;
  const statusConfig = statusConfigMap(t);

  return (
    <div className="space-y-3">
      {services.map((service) => {
        const config = statusConfig[service.status];
        const activeIncidents = incidents.filter(i => i.service_id === service.id && i.status !== 'resolved');
        const scheduledMaintenances = maintenances.filter(m => (m.service_id === service.id || m.service_id === null) && new Date(m.end_time) > new Date());

        return (
          <div key={service.id} className="bg-card border rounded-lg transition-all duration-300">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <config.Icon className={cn("h-6 w-6 flex-shrink-0", config.className)} />
                  <span className="font-bold text-lg text-foreground">{t(service.name.toLowerCase().replace(/ /g, '_'))}</span>
                </div>
                <div className={cn("font-semibold text-lg", config.className)}>{config.text}</div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">{t('ninety_day_uptime')}</div>
                  <div className="font-bold text-lg text-foreground">{service.uptime_percentage.toFixed(2)}%</div>
                </div>
                <ServiceUptimeSparkline serviceId={service.id} />
              </div>
            </div>
            {(activeIncidents.length > 0 || scheduledMaintenances.length > 0) && (
              <div className="border-t px-4 py-3 space-y-3">
                {activeIncidents.map(incident => (
                  <div key={incident.id} className="flex items-start gap-3 text-sm">
                    <ShieldAlert className="h-4 w-4 mt-0.5 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">{incident.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('updated')} {formatDistanceToNow(new Date(incident.updated_at), { addSuffix: true, locale: currentLocale })}
                      </p>
                    </div>
                  </div>
                ))}
                {scheduledMaintenances.map(maintenance => (
                  <div key={maintenance.id} className="flex items-start gap-3 text-sm">
                    <Clock className="h-4 w-4 mt-0.5 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">{maintenance.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('from')} {format(new Date(maintenance.start_time), 'd MMM, HH:mm', { locale: currentLocale })} {t('to')} {format(new Date(maintenance.end_time), 'HH:mm', { locale: currentLocale })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ServicesStatus;