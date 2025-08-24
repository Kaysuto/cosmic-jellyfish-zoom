import { useIncidents } from '@/hooks/useIncidents';
import { useServices } from '@/hooks/useServices';
import { useUsers } from '@/hooks/useUsers';
import { supabase } from '@/integrations/supabase/client';
import StatCard from '@/components/admin/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { Activity, ShieldAlert, UserPlus, MailQuestion } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RecentIncidents from '@/components/admin/dashboard/RecentIncidents';
import ServicesOverview from '@/components/admin/dashboard/ServicesOverview';
import QuickActions from '@/components/admin/dashboard/QuickActions';
import WebhookInstructions from '@/components/admin/WebhookInstructions';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { incidents, loading: incidentsLoading } = useIncidents();
  const { services, loading: servicesLoading } = useServices();
  const { users, loading: usersLoading } = useUsers();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [requestsLoading, setRequestsLoading] = useState(true);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      setRequestsLoading(true);
      const { count, error } = await supabase
        .from('media_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (error) {
        console.error("Error fetching pending requests count:", error);
      } else {
        setPendingRequests(count || 0);
      }
      setRequestsLoading(false);
    };
    fetchPendingRequests();
  }, []);

  const servicesWithIssues = services.filter(s => s.status === 'downtime' || s.status === 'degraded').length;
  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;

  const loading = incidentsLoading || servicesLoading || usersLoading || requestsLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">{t('admin_dashboard')}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? <Skeleton className="h-[108px]" /> : <StatCard title="Incidents Actifs" value={activeIncidents.toString()} icon={Activity} />}
        {loading ? <Skeleton className="h-[108px]" /> : <StatCard title="Services avec Problèmes" value={servicesWithIssues.toString()} icon={ShieldAlert} />}
        {loading ? <Skeleton className="h-[108px]" /> : <StatCard title="Demandes en Attente" value={pendingRequests.toString()} icon={MailQuestion} />}
        {loading ? <Skeleton className="h-[108px]" /> : <StatCard title="Utilisateurs" value={users.length.toString()} icon={UserPlus} />}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentIncidents />
          <ServicesOverview />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <QuickActions />
          <WebhookInstructions />
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;