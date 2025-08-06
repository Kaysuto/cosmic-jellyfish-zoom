import { useState } from 'react';
import { useServices, Service } from '@/hooks/useServices';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import ServiceForm, { ServiceFormValues } from './ServiceForm';
import { showSuccess, showError } from '@/utils/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ServiceManager = () => {
  const { t } = useTranslation();
  const { services, loading } = useServices();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleStatusChange = async (serviceId: string, status: Service['status']) => {
    const { error } = await supabase
      .from('services')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', serviceId);

    if (error) {
      showError(t('error_updating_service'));
    } else {
      showSuccess(t('service_updated_successfully'));
    }
  };

  const handleFormSubmit = async (values: ServiceFormValues) => {
    setIsSubmitting(true);
    const serviceData = {
      ...values,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (selectedService) {
      ({ error } = await supabase.from('services').update(serviceData).eq('id', selectedService.id));
    } else {
      ({ error } = await supabase.from('services').insert(serviceData));
    }

    if (error) {
      showError(t('error_saving_service'));
    } else {
      showSuccess(t('service_saved_successfully'));
      setIsFormOpen(false);
      setSelectedService(null);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (serviceId: string) => {
    const { error } = await supabase.from('services').delete().eq('id', serviceId);
    if (error) {
      showError(t('error_deleting_service'));
    } else {
      showSuccess(t('service_deleted_successfully'));
    }
  };

  const openCreateForm = () => {
    setSelectedService(null);
    setIsFormOpen(true);
  };

  const openEditForm = (service: Service) => {
    setSelectedService(service);
    setIsFormOpen(true);
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('manage_services')}</CardTitle>
        <Button onClick={openCreateForm}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('create_service')}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-muted/50 rounded-md gap-4">
              <div className="flex-grow">
                <p className="font-medium">{t(service.name.toLowerCase().replace(/ /g, '_'))}</p>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="w-full sm:w-40">
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
                <Button variant="ghost" size="icon" onClick={() => openEditForm(service)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('confirm_delete_title')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('confirm_delete_service')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(service.id)} className="bg-destructive hover:bg-destructive/90">
                        {t('delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedService ? t('edit_service') : t('create_service')}</DialogTitle>
          </DialogHeader>
          <ServiceForm
            service={selectedService}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ServiceManager;