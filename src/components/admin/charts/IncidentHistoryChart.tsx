import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Incident } from '@/hooks/useIncidents';
import { subDays, format, eachDayOfInterval, startOfDay } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { History } from 'lucide-react';

interface IncidentHistoryChartProps {
  incidents: Incident[];
}

const IncidentHistoryChart = ({ incidents }: IncidentHistoryChartProps) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const data = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 29);
    const today = new Date();
    const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

    const incidentsByDay = incidents.reduce((acc, incident) => {
      const day = format(startOfDay(new Date(incident.created_at)), 'yyyy-MM-dd');
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return dateRange.map(date => {
      const dayKey = format(date, 'yyyy-MM-dd');
      return {
        date: format(date, 'd MMM', { locale: currentLocale }),
        count: incidentsByDay[dayKey] || 0,
      };
    });
  }, [incidents, currentLocale]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          {t('incident_history_last_30_days')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncidentHistoryChart;