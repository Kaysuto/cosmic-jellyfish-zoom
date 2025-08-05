import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { TrendingUp, Loader2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
}

interface UptimeHistoryProps {
  services: Service[];
}

interface UptimeDataPoint {
  date: string;
  uptime: number;
  formattedDate: string;
}

const UptimeHistory: React.FC<UptimeHistoryProps> = ({ services }) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [services, selectedServiceId]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedServiceId) {
        setHistory([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('uptime_history')
        .select('*')
        .eq('service_id', selectedServiceId)
        .order('date', { ascending: true })
        .limit(365); // Fetch up to a year of data

      if (error) {
        console.error('Error fetching uptime history:', error);
        setHistory([]);
      } else {
        setHistory(data || []);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [selectedServiceId]);

  const chartData: UptimeDataPoint[] = history.map(record => ({
    date: record.date,
    uptime: record.uptime_percentage,
    formattedDate: new Date(record.date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }));

  const getGroupedData = () => {
    if (chartData.length === 0) return [];
    
    switch (timeRange) {
      case 'day':
        return chartData.slice(-30);
      
      case 'week':
        const weeklyData: Record<string, { total: number; count: number }> = {};
        chartData.slice(-90).forEach(point => {
          const date = new Date(point.date);
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
        const monthlyData: Record<string, { total: number; count: number }> = {};
        chartData.forEach(point => {
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
        const yearlyData: Record<string, { total: number; count: number }> = {};
        chartData.forEach(point => {
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
        return chartData.slice(-30);
    }
  };
  
  const groupedData = getGroupedData();
  
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
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          <CardTitle className="text-xl">
            {t('uptime_history')}
          </CardTitle>
        </div>
        
        {services.length > 0 && (
          <Select onValueChange={setSelectedServiceId} value={selectedServiceId || ''}>
            <SelectTrigger className="w-full sm:w-[220px] bg-gray-900 border-gray-700 text-white focus:ring-blue-500">
              <SelectValue placeholder={t('select_service')} />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              {services.map(service => (
                <SelectItem key={service.id} value={service.id} className="focus:bg-gray-700">
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      
      <CardContent className="relative">
        {loading && (
          <div className="absolute inset-0 bg-gray-800/80 flex items-center justify-center z-10 rounded-b-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          </div>
        )}
        <div className="min-h-[480px] flex flex-col">
          {history.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                <Button
                  variant={timeRange === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('day')}
                  className="rounded-full text-xs"
                >
                  Jour
                </Button>
                <Button
                  variant={timeRange === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('week')}
                  className="rounded-full text-xs"
                >
                  Semaine
                </Button>
                <Button
                  variant={timeRange === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('month')}
                  className="rounded-full text-xs"
                >
                  Mois
                </Button>
                <Button
                  variant={timeRange === 'year' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('year')}
                  className="rounded-full text-xs"
                >
                  Année
                </Button>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={groupedData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: '#9CA3AF' }}
                      tickFormatter={formatXAxis}
                      interval={timeRange === 'year' ? 0 : 'preserveStartEnd'}
                    />
                    <YAxis 
                      domain={[99.5, 100]} 
                      tick={{ fontSize: 12, fill: '#9CA3AF' }}
                      tickFormatter={(value) => `${value}%`}
                      width={40}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Uptime']}
                      labelFormatter={(value) => {
                        if (timeRange === 'day') {
                          return `Date: ${new Date(value).toLocaleDateString()}`;
                        }
                        const dataPoint = groupedData.find(d => d.date === value);
                        return dataPoint ? dataPoint.formattedDate : value;
                      }}
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151', 
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
                        color: '#F9FAFB'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="uptime" 
                      name="Disponibilité"
                      stroke="#60A5FA" 
                      activeDot={{ r: 6, fill: '#3B82F6' }} 
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#3B82F6' }}
                      animationDuration={500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-700">
                <div className="text-center p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl border border-blue-800/30">
                  <p className="text-sm text-gray-400">Moyenne</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">{stats.average.toFixed(2)}%</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl border border-green-800/30">
                  <p className="text-sm text-gray-400">Maximum</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">{stats.max.toFixed(2)}%</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-900/30 to-amber-800/20 rounded-xl border border-amber-800/30">
                  <p className="text-sm text-gray-400">Minimum</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">{stats.min.toFixed(2)}%</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-center text-gray-400">{t('no_uptime_history')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UptimeHistory;