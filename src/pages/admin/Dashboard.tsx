import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useUsers } from '@/hooks/useUsers';
import { useIncidents } from '@/hooks/useIncidents';
import { useServices } from '@/hooks/useServices';
import StatCard from '@/components/admin/dashboard/StatCard';
import { Users, AlertTriangle, Server, CheckCircle } from 'lucide-react';
import ServicesOverview from '@/components/admin/dashboard/ServicesOverview';
import RecentIncidents from '@/components/admin/dashboard/RecentIncidents';
import QuickActions from '@/components/admin/dashboard/QuickActions';
import RecentActivity from '@/components/admin/dashboard/RecentActivity';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSession } from '@/contexts/AuthContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { session } = useSession();
  const { users } = useUsers();
  const { incidents } = useIncidents();
  const { services } = useServices();

  const totalUsers = users.length;
  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;
  const totalServices = services.length;
  const operationalServices = services.filter(s => s.status === 'operational').length;

  const userName = session?.user?.user_metadata?.first_name || t('admin');

  return (
    <motion.div
      className="container mx-auto px-4 py-8 space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
          {t('admin_dashboard')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('hello_user', { name: userName })}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title={t('total_users')}
          value={totalUsers}
          icon={Users}
          description={t('manage_users_desc')}
        />
        <StatCard
          title={t('active_incidents')}
          value={activeIncidents}
          icon={AlertTriangle}
          description={t('manage_incidents_desc')}
          color="text-yellow-500"
        />
        <StatCard
          title={t('total_services')}
          value={totalServices}
          icon={Server}
          description={t('manage_services_desc')}
        />
        <StatCard
          title={t('operational_services')}
          value={operationalServices}
          icon={CheckCircle}
          description={t('operational_services_desc')}
          color="text-green-500"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div variants={slideInFromLeft}>
            <ServicesOverview />
          </motion.div>
          <motion.div variants={slideInFromLeft}>
            <RecentIncidents />
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div variants={itemVariants}>
            <QuickActions />
          </motion.div>
          <motion.div variants={itemVariants}>
            <RecentActivity />
          </motion.div>
          <motion.div variants={itemVariants}>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>{t('analytics')}</AccordionTrigger>
                <AccordionContent>
                  {t('analytics_coming_soon')}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;