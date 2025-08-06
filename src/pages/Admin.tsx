import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
        <Button onClick={handleLogout} variant="destructive">{t('logout')}</Button>
      </div>
      <div className="text-center py-16 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">{t('admin_dashboard_wip')}</p>
      </div>
    </div>
  );
};

export default Admin;