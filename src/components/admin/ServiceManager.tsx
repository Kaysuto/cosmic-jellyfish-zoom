import { useState } from 'react';
import { useServices, Service } from '@/hooks/useServices';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import ServiceForm, { ServiceFormValues } from './ServiceForm';
import { showSuccess, showError } from '@/utils/toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const ServiceManager = () => {
  const { t } = useTranslation();
  const { services, loading, refreshServices } = useServices();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const statusConfig = {
    operational: { text: t('operational'), className: 'bg-green-500/20 text-green-500 border-green-500/30' },
    degraded: { text: t('degraded'), className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
    downtime: { text: t('downtime'), className: 'bg-red-500/20 text-red-500 border-red-500/30' },
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
      setIsSheetOpen(false);
      setSelectedService(null);
      // Forcer le rafraîchissement après création/modification
      setTimeout(() => refreshServices(), 100);
    }
    setIsSubmitting(false);
  };

  const confirmDelete = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    
    const { error } = await supabase.from('services').delete().eq('id', serviceToDelete);
    
    if (error) {
      showError(t('error_deleting_service'));
    } else {
      showSuccess(t('service_deleted_successfully'));
      // Forcer le rafraîchissement après suppression
      setTimeout(() => refreshServices(), 100);
    }
    
    setIsDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const openCreateForm = () => {
    setSelectedService(null);
    setIsSheetOpen(true);
  };

  const openEditForm = (service: Service) => {
    setSelectedService(service);
    setIsSheetOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-64 w-full" /></CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('manage_services')}</CardTitle>
          <Button onClick={openCreateForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('create_service')}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('service')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="font-medium">{t(service.name.toLowerCase().replace(/ /g, '_'))}</div>
                    <div className="text-sm text-muted-foreground">{service.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('border', statusConfig[service.status].className)}>
                      {statusConfig[service.status].text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditForm(service)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>{t('edit')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDelete(service.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>{t('delete')}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedService ? t('edit_service') : t('create_service')}</SheetTitle>
            <SheetDescription>
              {selectedService ? t('edit_service_desc') : t('create_service_desc')}
            </SheetDescription>
          </SheetHeader>
          <ServiceForm
            service={selectedService}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsSheetOpen(false)}
            isSubmitting={isSubmitting}
          />
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_delete_title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirm_delete_service')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServiceToDelete(null)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ServiceManager;