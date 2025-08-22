import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { useUptimeHistory } from '@/hooks/useUptimeHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

interface ServiceUptimeSparklineProps {
  serviceId: string;
}

const ServiceUptimeSparkline = ({ serviceId }: ServiceUptimeSparklineProps) => {
  const { t } = useTranslation();
  const { uptimeData, loading } = useUptimeHistory(serviceId, 'month'); // Fetch 90 days of data

  const chartData = useMemo(() => {
    return uptimeData.map(item => ({
      date: item.date,
      uptime: item.uptime_percentage,
    }));
  }, [uptimeData]);

  if (loading) {
    return <Skeleton className="h-8 w-24" />;
  }

  const lastUptime = chartData.length > 0 ? chartData[chartData.length - 1].uptime : 100;
  const strokeColor = lastUptime < 99.9 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';

  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`sparklineGradient-${serviceId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              fontSize: '12px',
              padding: '4px 8px',
            }}
            labelFormatter={() => ''}
            formatter={(value: number) => [`${value.toFixed(2)}%`, t('uptime_legend')]}
          />
          <Area
            type="monotone"
            dataKey="uptime"
            stroke={strokeColor}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#sparklineGradient-${serviceId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ServiceUptimeSparkline;