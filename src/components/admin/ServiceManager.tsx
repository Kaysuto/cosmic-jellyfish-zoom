import { useServices, Service } from '@/hooks/useServices';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { showSuccess, showError } from '@/utils/toast';

const ServiceManager = () => {
  const { t } = useTranslation();
  const { services, loading } = useServices();

  const handleStatusChange = async (serviceId: string, status: Service['status']) => {
    const { error } = await supabase
      .from('services')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', serviceId);

    if (error) {
      showError(t('error_updating_service'));
      console.error(error);
    } else {
      showSuccess(t('service_updated_successfully'));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('manage_services')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-md">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-1/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('manage_services')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted/50 rounded-md gap-4">
              <span className="font-medium text-foreground">{t(service.name.toLowerCase().replace(/ /g, '_'))}</span>
              <div className="w-full sm:w-48">
                <Select
                  value={service.status}
                  onValueChange={(newStatus: Service['status']) => handleStatusChange(service.id, newStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">{t('operational')}</SelectItem>
                    <SelectItem value="degraded">{t('degraded')}</SelectItem>
                    <SelectItem value="downtime">{t('downtime')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceManager;