import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Service = {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'downtime' | 'maintenance';
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
  maintenance: {
    color: 'bg-gray-500',
    textKey: 'maintenance',
  },
};

const ServicesStatus = ({ services }: ServicesStatusProps) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const SERVICES_PER_PAGE = 3;

  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      const aIsPj = a.name.toLowerCase().includes('playjelly.fr');
      const bIsPj = b.name.toLowerCase().includes('playjelly.fr');

      if (aIsPj && !bIsPj) return -1;
      if (!aIsPj && bIsPj) return 1;

      return a.name.localeCompare(b.name);
    });
  }, [services]);

  const totalPages = Math.ceil(sortedServices.length / SERVICES_PER_PAGE);
  const startIndex = (currentPage - 1) * SERVICES_PER_PAGE;
  const currentServices = sortedServices.slice(startIndex, startIndex + SERVICES_PER_PAGE);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{t('services_status')}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="space-y-4">
          {currentServices.map((service) => {
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
                  {service.status !== 'downtime' && service.status !== 'maintenance' && (
                    <span className="text-sm text-muted-foreground">{t('uptime')} {service.uptime_percentage.toFixed(2)}%</span>
                  )}
                  <span className="text-sm font-semibold text-foreground">{t(statusConfig.textKey)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      {sortedServices.length > SERVICES_PER_PAGE && (
        <div className="flex-shrink-0 flex items-center justify-between w-full gap-2 text-white p-4 border-t border-gray-700/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('previous')}
          </Button>
          <span className="text-sm text-gray-400 font-mono">
            {t('page')} {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 disabled:opacity-50"
          >
            {t('next')}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ServicesStatus;