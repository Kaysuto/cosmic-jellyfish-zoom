import React from 'react';
import StatusHeader from '@/components/status/StatusHeader';
import ServiceStatus from '@/components/status/ServiceStatus';
import UptimeChart from '@/components/status/UptimeChart';
import IncidentHistory from '@/components/status/IncidentHistory';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { useServices } from '@/hooks/useServices';
import { useIncidents } from '@/hooks/useIncidents';
import { useUptimeHistory } from '@/hooks/useUptimeHistory';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

const StatusPage: React.FC = () => {
  const { t } = useTranslation();
  const { services, loading: servicesLoading } = useServices();
  const { incidents, loading: incidentsLoading } = useIncidents();
  const { uptimeData, loading: uptimeLoading } = useUptimeHistory();
  
  // Calculer le statut global
  const overallStatus = services.some(service => service.status === 'downtime') 
    ? 'downtime' 
    : services.some(service => service.status === 'degraded') 
      ? 'degraded' 
      : 'operational';

  // Formater les données pour le graphique
  const formattedUptimeData = uptimeData.map(dataPoint => ({
    date: dataPoint.date,
    uptime: parseFloat(dataPoint.uptime_percentage.toFixed(2)),
    formattedDate: new Date(dataPoint.date).toLocaleDateString()
  }));

  if (servicesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="w-full py-8">
            <div className="text-center mb-8">
              <Skeleton className="h-10 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-48 mx-auto" />
            </div>
            
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <StatusHeader 
          overallStatus={overallStatus} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {services.map((service) => (
            <ServiceStatus 
              key={service.id}
              name={service.name}
              status={service.status}
              description={service.description}
              uptime={service.uptime_percentage.toFixed(2)}
            />
          ))}
        </div>
        
        {!uptimeLoading && (
          <div className="mb-8">
            <UptimeChart data={formattedUptimeData} />
          </div>
        )}
        
        {!incidentsLoading && (
          <div className="mb-8">
            <IncidentHistory incidents={incidents} />
          </div>
        )}
        
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default StatusPage;