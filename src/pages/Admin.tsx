import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServiceManager from '@/components/admin/ServiceManager';
import IncidentManager from '@/components/admin/IncidentManager';
import MaintenanceManager from '@/components/admin/MaintenanceManager';
import UserManager from '@/components/admin/UserManager';
import AnalyticsPage from './admin/Analytics';
import { Settings, LogOut } from 'lucide-react';

const Admin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

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
      
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
          <TabsTrigger value="services">{t('manage_services')}</TabsTrigger>
          <TabsTrigger value="incidents">{t('manage_incidents')}</TabsTrigger>
          <TabsTrigger value="maintenance">{t('manage_maintenance')}</TabsTrigger>
          <TabsTrigger value="users">{t('manage_users')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="mt-4">
          <AnalyticsPage />
        </TabsContent>
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