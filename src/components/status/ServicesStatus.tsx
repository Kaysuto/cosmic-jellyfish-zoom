import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

type Service = {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'downtime' | 'maintenance';
  uptime_percentage: number;
  last_response_time_ms?: number | null;
};

type ServicesStatusProps = {
  services: Service[];
};

const statusIndicatorConfig = {
  operational: {
    color: 'bg-green-500',
    textKey: 'operational',
  },
  degraded: {
    color: 'bg-yellow-500',
    textKey: 'degraded',
  },
  downtime: {
    color: 'bg-red-500',
    textKey: 'downtime',
  },
  maintenance: {
    color: 'bg-gray-500',
    textKey: 'maintenance',
  },
};

const ServicesStatus = ({ services }: ServicesStatusProps) => {
  const { t } = useTranslation();

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map((service) => {
          const statusConfig = statusIndicatorConfig[service.status];
          return (
            <Card key={service.id} className="bg-card hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">{t(service.name.toLowerCase().replace(/ /g, '_'))}</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={cn("h-3 w-3 rounded-full cursor-pointer", statusConfig.color)}></span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t(statusConfig.textKey)}</p>
                  </TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-muted-foreground">{t('uptime')} (90j)</span>
                  <span className="text-lg font-bold text-foreground">{service.uptime_percentage.toFixed(2)}%</span>
                </div>
                {service.status === 'operational' && service.last_response_time_ms !== null ? (
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground">Ping</span>
                    <span className="text-lg font-bold text-green-400">{service.last_response_time_ms} ms</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground">Statut</span>
                    <span className="text-lg font-bold text-foreground">{t(statusConfig.textKey)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default ServicesStatus;