import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UptimeHistoryProps {
  services: { id: string; name: string }[];
}

type TimeRange = 'day' | 'week' | 'month';

const UptimeHistory: React.FC<UptimeHistoryProps> = ({ services }) => {
  const { t } = useTranslation();
  const [uptimeHistory, setUptimeHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const daysForRange: Record<TimeRange, number> = {
    day: 1,
    week: 7,
    month: 30,
  };

  useEffect(() => {
    const fetchUptimeHistory = async () => {
      if (!services.length) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const days = daysForRange[timeRange];
      const startDate = subDays(new Date(), days - 1);
      const serviceIds = services.map(s => s.id);

      const { data, error } = await supabase
        .from('uptime_history')
        .select('date, uptime_percentage, service_id')
        .in('service_id', serviceIds)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching uptime history:', error);
        setUptimeHistory([]);
      } else {
        const processedData = services.map(service => {
          const history = Array.from({ length: days }, (_, i) => {
            const date = subDays(new Date(), days - 1 - i);
            const dateString = format(date, 'yyyy-MM-dd');
            const record = data.find(d => d.service_id === service.id && d.date === dateString);
            return {
              date: dateString,
              uptime: record ? record.uptime_percentage : 100,
              status: record ? (record.uptime_percentage < 100 ? 'incident' : 'operational') : 'operational'
            };
          });
          return {
            name: service.name,
            history,
          };
        });
        setUptimeHistory(processedData);
      }
      setLoading(false);
    };

    fetchUptimeHistory();
  }, [services, timeRange]);

  return (
    <Card className="bg-gray-800/50 border-white/10 text-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t('uptime_history')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          <Button
            variant={timeRange === 'day' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('day')}
            className="text-white border-white/20 hover:bg-white/10"
          >
            {t('day')}
          </Button>
          <Button
            variant={timeRange === 'week' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
            className="text-white border-white/20 hover:bg-white/10"
          >
            {t('week')}
          </Button>
          <Button
            variant={timeRange === 'month' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('month')}
            className="text-white border-white/20 hover:bg-white/10"
          >
            {t('month')}
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-8">{t('loading')}...</div>
        ) : (
          <TooltipProvider>
            <div className="space-y-6">
              {uptimeHistory.map(service => (
                <div key={service.name}>
                  <h4 className="font-medium mb-2">{service.name}</h4>
                  <div className="flex items-center gap-1 h-8">
                    {service.history.map((day: any, index: number) => (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <div
                            className={`h-full flex-1 rounded ${
                              day.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-900 text-white border-gray-700">
                          <p>{format(new Date(day.date), 'MMM d, yyyy')}: {day.uptime}%</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
};

export default UptimeHistory;