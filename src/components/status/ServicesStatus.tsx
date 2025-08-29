import { useState } from 'react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { t } = useSafeTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const SERVICES_PER_PAGE = 4;

  const totalPages = Math.ceil(services.length / SERVICES_PER_PAGE);
  const startIndex = (currentPage - 1) * SERVICES_PER_PAGE;
  const currentServices = services.slice(startIndex, startIndex + SERVICES_PER_PAGE);

  return (
    <Card className="flex flex-col h-full bg-card">
      <CardHeader>
        <CardTitle>{t('services_status')}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-start overflow-y-auto py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-4"
          >
            {currentServices.map((service) => {
              const statusConfig = statusIndicatorConfig[service.status];
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted rounded-md gap-2"
                >
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
                      <span className="text-sm text-muted-foreground">{service.uptime_percentage.toFixed(2)}%</span>
                    )}
                    
                    {service.status === 'operational' && service.last_response_time_ms !== null ? (
                      <span className="text-sm text-green-400">{service.last_response_time_ms} ms</span>
                    ) : (
                      <span className="text-sm font-semibold text-foreground">{t(statusConfig.textKey)}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </CardContent>
      {services.length > SERVICES_PER_PAGE && (
        <div className="flex-shrink-0 flex items-center justify-between w-full gap-2 p-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('previous')}
          </Button>
          <span className="text-sm text-muted-foreground font-mono">
            {t('page')} {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
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