import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Service {
  id: string;
  name: string;
}

interface UptimeHistoryProps {
  services: Service[];
}

const UptimeHistory: React.FC<UptimeHistoryProps> = ({ services }) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [services, selectedServiceId]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedServiceId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('uptime_history')
        .select('*')
        .eq('service_id', selectedServiceId)
        .order('date', { ascending: false })
        .limit(90);

      if (error) {
        console.error('Error fetching uptime history:', error);
        setHistory([]);
      } else {
        setHistory(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [selectedServiceId]);

  const getUptimeColor = (percentage: number) => {
    if (percentage >= 99.9) return 'text-green-400';
    if (percentage >= 99) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-white">{t('uptime_history')}</CardTitle>
          {services.length > 0 && (
            <Select onValueChange={setSelectedServiceId} value={selectedServiceId || ''}>
              <SelectTrigger className="w-[220px] bg-gray-900 border-gray-700 text-white focus:ring-blue-500">
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
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-gray-400 py-10">{t('loading')}...</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {history.length > 0 ? history.map((record) => (
              <div key={record.id} className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                <span className="text-gray-300">{new Date(record.date).toLocaleDateString()}</span>
                <span className={`font-semibold ${getUptimeColor(record.uptime_percentage)}`}>
                  {Number(record.uptime_percentage).toFixed(2)}%
                </span>
              </div>
            )) : (
              <p className="text-center text-gray-400 py-10">{t('no_uptime_history')}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UptimeHistory;