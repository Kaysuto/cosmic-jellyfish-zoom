import { useState, useEffect, useMemo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays, format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

type UptimeRecord = {
  date: string;
  uptime_percentage: number;
};

const UptimeHistory = ({ serviceId, children }: { serviceId: string | null; children?: ReactNode }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [uptimeData, setUptimeData] = useState<UptimeRecord[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  useEffect(() => {
    const fetchUptimeHistory = async () => {
      if (!serviceId) {
        setUptimeData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const daysToFetch = timeRange === 'month' ? 90 : timeRange === 'week' ? 30 : 7;
      const startDate = subDays(new Date(), daysToFetch);

      const { data, error } = await supabase
        .from('uptime_history')
        .select('date, uptime_percentage')
        .eq('service_id', serviceId)
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
  }, [serviceId, timeRange]);

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
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} tickFormatter={(value) => `${value}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={() => t('uptime_legend')} />
          <Line type="monotone" dataKey="uptime_percentage" name={t('uptime_legend')} stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-grow">
            <CardTitle>{t('uptime_history')}</CardTitle>
            {children && <div className="mt-2">{children}</div>}
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