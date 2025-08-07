import { useIncidents } from '@/hooks/useIncidents';
import IncidentHistoryChart from '@/components/admin/charts/IncidentHistoryChart';
import IncidentStatusChart from '@/components/admin/charts/IncidentStatusChart';
import { Skeleton } from '@/components/ui/skeleton';

const AnalyticsPage = () => {
  const { incidents, loading: incidentsLoading } = useIncidents();

  if (incidentsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[380px] w-full" />
        <Skeleton className="h-[380px] w-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <IncidentStatusChart incidents={incidents} />
      <IncidentHistoryChart incidents={incidents} />
    </div>
  );
};

export default AnalyticsPage;