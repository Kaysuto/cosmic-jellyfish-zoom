import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Service = {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'downtime';
  uptime_percentage: number;
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
};

const ServicesStatus = ({ services }: ServicesStatusProps) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('services_status')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => {
            const statusConfig = statusIndicatorConfig[service.status];
            return (
              <div key={service.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted/50 rounded-md gap-2">
                <div className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={cn("h-3 w-3 rounded-full mr-3 shrink-0 cursor-pointer", statusConfig.color)}></span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t(statusConfig.textKey)}</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="font-medium text-foreground">{t(service.name.toLowerCase().replace(/ /g, '_'))}</span>
                </div>
                <div className="flex items-center gap-4 pl-6 sm:pl-0">
                  {service.status !== 'downtime' && (
                    <span className="text-sm text-muted-foreground">{t('uptime')} {service.uptime_percentage.toFixed(2)}%</span>
                  )}
                  <span className="text-sm font-semibold text-foreground">{t(statusConfig.textKey)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicesStatus;