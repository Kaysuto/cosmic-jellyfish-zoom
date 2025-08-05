import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UptimeDataPoint {
  date: string;
  uptime: number;
  formattedDate: string;
}

interface UptimeChartProps {
  data: UptimeDataPoint[];
}

const UptimeChart: React.FC<UptimeChartProps> = ({ data }) => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  
  // Fonction pour regrouper les données selon la période sélectionnée
  const getGroupedData = () => {
    if (data.length === 0) return [];
    
    switch (timeRange) {
      case 'day':
        // Afficher les 30 derniers jours
        return data.slice(-30);
      
      case 'week':
        // Regrouper par semaine
        const weeklyData: Record<string, { total: number; count: number }> = {};
        data.slice(-90).forEach(point => {
          const date = new Date(point.date);
          // Obtenir le lundi de la semaine
          const monday = new Date(date);
          const day = monday.getDay();
          const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
          monday.setDate(diff);
          monday.setHours(0, 0, 0, 0);
          
          const weekKey = monday.toISOString().split('T')[0];
          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = { total: 0, count: 0 };
          }
          weeklyData[weekKey].total += point.uptime;
          weeklyData[weekKey].count++;
        });
        
        return Object.entries(weeklyData).map(([week, { total, count }]) => ({
          date: week,
          uptime: parseFloat((total / count).toFixed(2)),
          formattedDate: `Semaine du ${new Date(week).toLocaleDateString()}`
        }));
      
      case 'month':
        // Regrouper par mois
        const monthlyData: Record<string, { total: number; count: number }> = {};
        data.forEach(point => {
          const date = new Date(point.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { total: 0, count: 0 };
          }
          monthlyData[monthKey].total += point.uptime;
          monthlyData[monthKey].count++;
        });
        
        return Object.entries(monthlyData).map(([month, { total, count }]) => ({
          date: month,
          uptime: parseFloat((total / count).toFixed(2)),
          formattedDate: new Date(`${month}-01`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        }));
      
      case 'year':
        // Regrouper par année
        const yearlyData: Record<string, { total: number; count: number }> = {};
        data.forEach(point => {
          const date = new Date(point.date);
          const yearKey = date.getFullYear().toString();
          if (!yearlyData[yearKey]) {
            yearlyData[yearKey] = { total: 0, count: 0 };
          }
          yearlyData[yearKey].total += point.uptime;
          yearlyData[yearKey].count++;
        });
        
        return Object.entries(yearlyData).map(([year, { total, count }]) => ({
          date: year,
          uptime: parseFloat((total / count).toFixed(2)),
          formattedDate: `Année ${year}`
        }));
      
      default:
        return data.slice(-30);
    }
  };
  
  const groupedData = getGroupedData();
  
  // Calculer les statistiques
  const stats = groupedData.length > 0 ? {
    average: groupedData.reduce((sum, point) => sum + point.uptime, 0) / groupedData.length,
    min: Math.min(...groupedData.map(point => point.uptime)),
    max: Math.max(...groupedData.map(point => point.uptime))
  } : { average: 0, min: 0, max: 0 };
  
  const formatXAxis = (value: string) => {
    switch (timeRange) {
      case 'day':
        return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      case 'week':
        // Correction de l'erreur TypeScript - utilisation d'une approche différente
        const date = new Date(value);
        const weekNumber = Math.ceil((((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000) + new Date(date.getFullYear(), 0, 1).getDay() + 1) / 7);
        return `Sem. ${weekNumber}`;
      case 'month':
        return new Date(`${value}-01`).toLocaleDateString('fr-FR', { month: 'short' });
      case 'year':
        return value;
      default:
        return value;
    }
  };
  
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-500" />
            {t('uptime_history')}
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Disponibilité moyenne: {stats.average.toFixed(2)}%
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={timeRange === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('day')}
            className="rounded-full"
          >
            Jour
          </Button>
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
            className="rounded-full"
          >
            Semaine
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('month')}
            className="rounded-full"
          >
            Mois
          </Button>
          <Button
            variant={timeRange === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('year')}
            className="rounded-full"
          >
            Année
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={groupedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={formatXAxis}
                interval={timeRange === 'year' ? 0 : 'preserveStartEnd'}
              />
              <YAxis 
                domain={[99.5, 100]} 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
                width={40}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Uptime']}
                labelFormatter={(value) => {
                  if (timeRange === 'day') {
                    return `Date: ${new Date(value).toLocaleDateString()}`;
                  }
                  return groupedData.find(d => d.date === value)?.formattedDate || value;
                }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="uptime" 
                name="Disponibilité"
                stroke="#3b82f6" 
                activeDot={{ r: 6, fill: '#3b82f6' }} 
                strokeWidth={3}
                dot={{ r: 3, fill: '#3b82f6' }}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Moyenne</p>
            <p className="text-lg font-semibold text-blue-600">{stats.average.toFixed(2)}%</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Maximum</p>
            <p className="text-lg font-semibold text-green-600">{stats.max.toFixed(2)}%</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <p className="text-sm text-gray-600">Minimum</p>
            <p className="text-lg font-semibold text-amber-600">{stats.min.toFixed(2)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UptimeChart;