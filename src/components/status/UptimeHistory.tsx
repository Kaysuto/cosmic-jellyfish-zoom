import { useState, useEffect, useMemo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays, format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Service } from '@/hooks/useServices';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type UptimeRecord = {
  date: string;
  uptime_percentage: number;
  avg_response_time_ms: number | null;
};

const NextUpdateTimer = () => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextUpdate = new Date(now);
      nextUpdate.setUTCHours(24, 0, 0, 0); // Prochain minuit UTC

      const diff = nextUpdate.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <CardDescription>
      {t('next_update_in')} <span className="font-mono font-semibold text-foreground">{timeLeft}</span>
    </CardDescription>
  );
};

const UptimeHistory = ({ service, children }: { service: Service; children?: ReactNode }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [uptimeData, setUptimeData] = useState<UptimeRecord[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const handleSelectOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--removed-body-scroll-bar-size', `${scrollbarWidth}px`);
      document.documentElement.setAttribute('data-radix-select-visible', 'true');
    } else {
      document.documentElement.removeAttribute('data-radix-select-visible');
    }
  };

  useEffect(() => {
    const fetchUptimeHistory = async () => {
      if (!service || !service.id) {
        setUptimeData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const daysToFetch = timeRange === 'month' ? 90 : timeRange === 'week' ? 30 : 7;
      const startDate = subDays(new Date(), daysToFetch);

      const { data, error } = await supabase
        .from('uptime_history')
        .select('date, uptime_percentage, avg_response_time_ms')
        .eq('service_id', service.id)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching uptime history:', error);
        setUptimeData([]);
      } else {
        setUptimeData(data as UptimeRecord[]);
      }
      setLoading(false);
    };

    fetchUptimeHistory();

    const channel: RealtimeChannel = supabase
      .channel(`uptime-history-${service.id || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'uptime_history',
          filter: service.id ? `service_id=eq.${service.id}` : undefined,
        },
        () => {
          fetchUptimeHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [service, timeRange]);

  const chartData = useMemo(() => {
    return uptimeData.map(item => ({
      ...item,
      date: format(new Date(item.date), 'd MMM', { locale: currentLocale }),
    }));
  }, [uptimeData, currentLocale]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded shadow-lg text-sm">
          <p className="font-bold">{label}</p>
          <p style={{ color: payload[0].color }}>
            {`${t('uptime_legend')}: ${payload[0].value.toFixed(2)}%`}
          </p>
          {payload[1] && payload[1].value !== null && (
            <p style={{ color: payload[1].color }}>
              {`${t('ping_legend')}: ${payload[1].value}ms`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (loading) {
      return <Skeleton className="h-[300px] w-full" />;
    }
    if (chartData.length === 0) {
      const serviceCreationDate = new Date(service.created_at);
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      if (serviceCreationDate > oneDayAgo) {
        return (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-center p-4">
            {t('new_service_uptime_message')}
          </div>
        );
      }
      
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          {t('no_uptime_history')}
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" stroke="hsl(var(--primary))" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} tickFormatter={(value) => `${value}%`} />
          <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}ms`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="uptime_percentage" name={t('uptime_legend')} stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="avg_response_time_ms" name={t('ping_legend')} stroke="hsl(var(--muted-foreground))" dot={false} strokeWidth={2} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-grow">
            <CardTitle>{t('uptime_history')}</CardTitle>
            <NextUpdateTimer />
            {children && (
              <div className="mt-2">
                <Select
                  value={service.id ?? ''}
                  onValueChange={(value) => {
                    const childSelect = children as React.ReactElement<any>;
                    if (childSelect && childSelect.props.onValueChange) {
                      childSelect.props.onValueChange(value);
                    }
                  }}
                  onOpenChange={handleSelectOpenChange}
                >
                  {children}
                </Select>
              </div>
            )}
        </div>
        <div className="flex items-center gap-1 self-start sm:self-center shrink-0">
          <Button size="sm" variant={timeRange === 'day' ? 'secondary' : 'ghost'} onClick={() => setTimeRange('day')}>{t('time_range_day')}</Button>
          <Button size="sm" variant={timeRange === 'week' ? 'secondary' : 'ghost'} onClick={() => setTimeRange('week')}>{t('time_range_week')}</Button>
          <Button size="sm" variant={timeRange === 'month' ? 'secondary' : 'ghost'} onClick={() => setTimeRange('month')}>{t('time_range_month')}</Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default UptimeHistory;