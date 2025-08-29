import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip } from 'recharts';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Incident } from '@/types/status';
import { subDays, format, eachDayOfInterval, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface IncidentHistoryChartProps {
  incidents: Incident[];
}

const IncidentHistoryChart = ({ incidents }: IncidentHistoryChartProps) => {
  const { t } = useSafeTranslation();

  const endDate = new Date();
  const startDate = subDays(endDate, 29);
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  const data = dateRange.map(date => {
    const dayStr = format(date, 'yyyy-MM-dd');
    const incidentsOnDay = incidents.filter(
      incident => format(startOfDay(new Date(incident.created_at)), 'yyyy-MM-dd') === dayStr
    ).length;
    return {
      date: format(date, 'd MMM', { locale: fr }),
      incidents: incidentsOnDay,
    };
  });

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('incident_history_last_30_days')}</CardTitle>
      </CardHeader>
      <CardContent>
        {incidents.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">{t('no_incident_data')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Bar dataKey="incidents" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default IncidentHistoryChart;