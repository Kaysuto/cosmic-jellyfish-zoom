import { useState, useEffect, useMemo } from 'react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { subDays, format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Service } from '@/hooks/useServices';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUptimeHistory } from '@/hooks/useUptimeHistory';

const NextUpdateTimer = () => {
  const { t } = useSafeTranslation();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextUpdate = new Date(now);
      nextUpdate.setUTCHours(24, 0, 0, 0);

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

interface UptimeHistoryProps {
  services: Service[];
  selectedServiceId: string | null;
  onServiceChange: (serviceId: string) => void;
}

const UptimeHistory = ({ services, selectedServiceId, onServiceChange }: UptimeHistoryProps) => {
  const { t, i18n } = useSafeTranslation();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');
  const { uptimeData, loading } = useUptimeHistory(selectedServiceId, timeRange);

  const currentLocale = i18n.language === 'fr' ? fr : enUS;
  const selectedService = services.find(s => s.id === selectedServiceId);

  const chartData = useMemo(() => {
    return uptimeData.map(item => ({
      ...item,
      date: format(new Date(item.date), 'd MMM', { locale: currentLocale }),
    }));
  }, [uptimeData, currentLocale]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const uptimePayload = payload.find((p: any) => p.dataKey === 'uptime_percentage');
      const pingPayload = payload.find((p: any) => p.dataKey === 'avg_response_time_ms');

      return (
        <div className="bg-background p-2 border rounded shadow-lg text-sm">
          <p className="font-bold">{label}</p>
          {uptimePayload && (
            <p style={{ color: uptimePayload.color }}>
              {`${t('uptime_legend')}: ${uptimePayload.value.toFixed(2)}%`}
            </p>
          )}
          {pingPayload && pingPayload.value !== null && (
            <p>
              {`${t('ping_legend')}: ${pingPayload.value}ms`}
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

    let emptyMessage = t('no_uptime_history');
    if (selectedService) {
      const serviceCreationDate = new Date(selectedService.created_at);
      const oneDayAgo = subDays(new Date(), 1);
      if (serviceCreationDate > oneDayAgo) {
        emptyMessage = t('new_service_uptime_message');
      }
    }

    return (
      <div className="relative h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="hsl(var(--primary))" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} tickFormatter={(value) => `${value}%`} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}ms`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
            {chartData.length > 0 && (
              <>
                <Bar yAxisId="right" dataKey="avg_response_time_ms" name={t('ping_legend')} fill="hsl(var(--muted-foreground))" barSize={20} />
                <Line yAxisId="left" type="monotone" dataKey="uptime_percentage" name={t('uptime_legend')} stroke="hsl(var(--primary))" dot={false} strokeWidth={2} />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
        {chartData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-center p-4 bg-background/50 rounded-md">
            {emptyMessage}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-grow">
            <CardTitle>{t('uptime_history')}</CardTitle>
            <NextUpdateTimer />
            <div className="mt-2">
              <Select value={selectedServiceId ?? ''} onValueChange={onServiceChange}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder={t('select_service')} />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {t(service.name.toLowerCase().replace(/ /g, '_'))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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