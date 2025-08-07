import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Incident } from '@/hooks/useIncidents';
import { AlertTriangle } from 'lucide-react';

interface IncidentStatusChartProps {
  incidents: Incident[];
}

const COLORS = {
  investigating: '#3b82f6', // blue-500
  identified: '#f59e0b',    // amber-500
  monitoring: '#8b5cf6',   // violet-500
  resolved: '#22c55e',     // green-500
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {payload[0].name}
          </span>
          <span className="font-bold text-foreground">
            {payload[0].value}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const IncidentStatusChart = ({ incidents }: IncidentStatusChartProps) => {
  const { t } = useTranslation();

  const data = useMemo(() => {
    const statusCounts = incidents.reduce((acc, incident) => {
      acc[incident.status] = (acc[incident.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([key, value]) => ({
      key,
      name: t(key),
      value,
    }));
  }, [incidents, t]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {t('incidents_by_status')}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">{t('no_incident_data')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {t('incidents_by_status')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.key as keyof typeof COLORS] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<CustomTooltip />}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncidentStatusChart;