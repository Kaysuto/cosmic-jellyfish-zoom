import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Maintenance } from '@/hooks/useMaintenances';
import { Button } from '@/components/ui/button';

interface ScheduledMaintenancesProps {
  maintenances: Maintenance[];
}

const ScheduledMaintenances = ({ maintenances }: ScheduledMaintenancesProps) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;
  const [currentPage, setCurrentPage] = useState(1);
  const MAINTENANCES_PER_PAGE = 1;

  const upcomingMaintenances = maintenances.filter(m => new Date(m.end_time) > new Date());
  
  const totalPages = Math.ceil(upcomingMaintenances.length / MAINTENANCES_PER_PAGE);
  const startIndex = (currentPage - 1) * MAINTENANCES_PER_PAGE;
  const currentMaintenances = upcomingMaintenances.slice(startIndex, startIndex + MAINTENANCES_PER_PAGE);

  if (upcomingMaintenances.length === 0) {
    return null;
  }

  return (
    <Card className="bg-blue-900/30 border-blue-500/30 flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-white">
          <Wrench className="h-5 w-5 text-blue-400" />
          {t('scheduled_maintenance')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        {currentMaintenances.map(m => (
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
      </CardContent>
      {totalPages > 1 && (
        <div className="flex-shrink-0 flex items-center justify-between w-full gap-2 text-white p-4 border-t border-blue-500/30">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="bg-blue-800/50 border-blue-600 hover:bg-blue-700/50 disabled:opacity-50"
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
            className="bg-blue-800/50 border-blue-600 hover:bg-blue-700/50 disabled:opacity-50"
          >
            {t('next')}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ScheduledMaintenances;