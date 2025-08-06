import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServiceManager from '@/components/admin/ServiceManager';
import IncidentManager from '@/components/admin/IncidentManager';
import MaintenanceManager from '@/components/admin/MaintenanceManager';
import UserManager from '@/components/admin/UserManager';
import { Settings, LogOut, Server, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useServices } from '@/hooks/useServices';
import { useIncidents } from '@/hooks/useIncidents';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInMinutes } from 'date-fns';

const Admin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { services, loading: servicesLoading } = useServices();
  const { incidents, loading: incidentsLoading } = useIncidents();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const operationalServices = services.filter(s => s.status === 'operational').length;
  const activeIncidents = incidents.filter(i => i.status !== 'resolved').length;
  
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved' && i.resolved_at);
  const totalResolutionTime = resolvedIncidents.reduce((acc, i) => {
    return acc + differenceInMinutes(new Date(i.resolved_at!), new Date(i.created_at));
  }, 0);
  const avgResolutionTime = resolvedIncidents.length > 0 ? Math.round(totalResolutionTime / resolvedIncidents.length) : 0;

  const loading = servicesLoading || incidentsLoading;

  const AdminStats = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('total_services')}</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{services.length}</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('operational_services')}</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{operationalServices}</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('active_incidents')}</CardTitle>
          <ShieldAlert className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{activeIncidents}</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('avg_resolution_time')}</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{avgResolutionTime} min</div>}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('admin_dashboard')}</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon">
            <Link to="/admin/settings">
              <Settings className="h-4 w-4" />
              <span className="sr-only">{t('settings')}</span>
            </Link>
          </Button>
          <Button onClick={handleLogout} variant="destructive">
            <LogOut className="mr-2 h-4 w-4" />
            {t('logout')}
          </Button>
        </div>
      </div>
      
      <AdminStats />

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">{t('manage_services')}</TabsTrigger>
          <TabsTrigger value="incidents">{t('manage_incidents')}</TabsTrigger>
          <TabsTrigger value="maintenance">{t('manage_maintenance')}</TabsTrigger>
          <TabsTrigger value="users">{t('manage_users')}</TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="mt-4">
          <ServiceManager />
        </TabsContent>
        <TabsContent value="incidents" className="mt-4">
          <IncidentManager />
        </TabsContent>
        <TabsContent value="maintenance" className="mt-4">
          <MaintenanceManager />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <UserManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;