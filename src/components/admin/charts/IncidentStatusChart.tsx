import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Incident } from '@/types/status';
import { AlertTriangle } from 'lucide-react';

interface IncidentStatusChartProps {
  incidents: Incident[];
}

const COLORS = {
  investigating: '#facc15', // yellow-400
  identified: '#fb923c',    // orange-400
  monitoring: '#60a5fa',    // blue-400
  resolved: '#4ade80',      // green-400
};

const IncidentStatusChart = ({ incidents }: IncidentStatusChartProps) => {
  const { t } = useSafeTranslation();

  const statusCounts = incidents.reduce((acc, incident) => {
    acc[incident.status] = (acc[incident.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(statusCounts).map(([name, value]) => ({
    name: t(name),
    value,
  }));

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t('incidents_by_status')}</CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">{t('no_incident_data')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[Object.keys(statusCounts)[index] as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default IncidentStatusChart;