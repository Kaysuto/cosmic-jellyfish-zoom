import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServiceManager from '@/components/admin/ServiceManager';
import IncidentManager from '@/components/admin/IncidentManager';
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
      
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">{t('manage_services')}</TabsTrigger>
          <TabsTrigger value="incidents">{t('manage_incidents')}</TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="mt-4">
          <ServiceManager />
        </TabsContent>
        <TabsContent value="incidents" className="mt-4">
          <IncidentManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;