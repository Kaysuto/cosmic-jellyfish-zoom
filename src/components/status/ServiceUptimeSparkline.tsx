import { useMemo } from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell } from 'recharts';
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
    // We want to show the last 90 days, so we'll take the tail of the data.
    const last90DaysData = uptimeData.slice(-90);
    return last90DaysData.map(item => ({
      date: item.date,
      uptime: item.uptime_percentage,
    }));
  }, [uptimeData]);

  if (loading) {
    return <Skeleton className="h-8 w-24" />;
  }

  const getColor = (uptime: number) => {
    if (uptime === 100) {
      return 'hsl(142.1 76.2% 41.2%)'; // green-600
    }
    if (uptime >= 99.9) {
      return 'hsl(47.9 95.8% 53.1%)'; // yellow-500
    }
    return 'hsl(0 84.2% 60.2%)'; // red-500
  };

  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barGap={1}>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              fontSize: '12px',
              padding: '4px 8px',
            }}
            labelFormatter={() => ''}
            formatter={(value: number) => [`${value.toFixed(2)}%`, t('uptime_legend')]}
            cursor={{ fill: 'transparent' }}
          />
          <Bar dataKey="uptime">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.uptime)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ServiceUptimeSparkline;