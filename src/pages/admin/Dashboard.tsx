import { useIncidents } from '@/hooks/useIncidents';
import { useServices } from '@/hooks/useServices';
import IncidentHistoryChart from '@/components/admin/charts/IncidentHistoryChart';
import IncidentStatusChart from '@/components/admin/charts/IncidentStatusChart';
import StatCard from '@/components/admin/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { differenceInHours } from 'date-fns';
import { Activity, BarChart, ShieldCheck, Timer } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { incidents, loading: incidentsLoading } = useIncidents();
  const { services, loading: servicesLoading } = useServices();

  const totalServices = services.length;
  const operationalServices = services.filter(s => s.status === 'operational').length;
  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;

  const avgResolutionTime = () => {
    const resolvedIncidents = incidents.filter(i => i.status === 'resolved' && i.resolved_at);
    if (resolvedIncidents.length === 0) return `N/A`;
    
    const totalDuration = resolvedIncidents.reduce((acc, i) => {
      if (i.resolved_at) {
        const duration = differenceInHours(new Date(i.resolved_at), new Date(i.created_at));
        return acc + duration;
      }
      return acc;
    }, 0);

    const avgHours = totalDuration / resolvedIncidents.length;
    return `${avgHours.toFixed(1)}h`;
  };

  const loading = incidentsLoading || servicesLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[108px]" />
          <Skeleton className="h-[108px]" />
          <Skeleton className="h-[108px]" />
          <Skeleton className="h-[108px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <Skeleton className="h-[380px] w-full lg:col-span-4" />
          <Skeleton className="h-[380px] w-full lg:col-span-3" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
       <h1 className="text-3xl font-bold">{t('admin_dashboard')}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('total_services')} value={totalServices.toString()} icon={BarChart} />
        <StatCard title={t('operational_services')} value={`${operationalServices}`} icon={ShieldCheck} />
        <StatCard title={t('active_incidents')} value={activeIncidents.toString()} icon={Activity} />
        <StatCard title={t('avg_resolution_time')} value={avgResolutionTime()} icon={Timer} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-4">
          <IncidentHistoryChart incidents={incidents} />
        </div>
        <div className="lg:col-span-3">
          <IncidentStatusChart incidents={incidents} />
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;