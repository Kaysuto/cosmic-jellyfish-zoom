import { useState } from 'react';
import { useServices, Service } from '@/hooks/useServices';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit, Trash2, MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import ServiceForm, { ServiceFormValues } from './ServiceForm';
import { showSuccess, showError } from '@/utils/toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useSession } from '@/contexts/AuthContext';

const ServiceManager = () => {
  const { t } = useTranslation();
  const { services, loading, refreshServices } = useServices();
  const { session } = useSession();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const statusConfig = {
    operational: { text: t('operational'), className: 'bg-green-500/20 text-green-500 border-green-500/30' },
    degraded: { text: t('degraded'), className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
    downtime: { text: t('downtime'), className: 'bg-red-500/20 text-red-500 border-red-500/30' },
    maintenance: { text: 'En maintenance', className: 'bg-gray-500/20 text-gray-500 border-gray-500/30' },
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const serviceToMove = services[index];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const serviceToSwap = services[swapIndex];

    if (!serviceToMove || !serviceToSwap) return;

    const { error } = await supabase.rpc('swap_service_positions', {
      service_id_1: serviceToMove.id,
      service_id_2: serviceToSwap.id,
    });

    if (error) {
      showError("Erreur lors de la réorganisation.");
    } else {
      refreshServices();
    }
  };

  const handleFormSubmit = async (values: ServiceFormValues) => {
    setIsSubmitting(true);
    
    const hasUrl = values.url && values.url.trim() !== '';
    const serviceData = {
      ...values,
      url: hasUrl ? values.url : null,
      status: selectedService ? selectedService.status : (hasUrl ? 'operational' : 'maintenance'),
      updated_at: new Date().toISOString(),
      position: selectedService ? selectedService.position : (services.length > 0 ? Math.max(...services.map(s => s.position)) + 1 : 1),
    };

    if (selectedService) {
      const { error } = await supabase.from('services').update(serviceData).eq('id', selectedService.id);
      if (error) {
        showError(t('error_saving_service'));
      } else {
        showSuccess(t('service_saved_successfully'));
        if (session?.user.id) {
          await supabase.from('audit_logs').insert({ user_id: session.user.id, action: 'service_updated', details: { service_id: selectedService.id, name: values.name } });
        }
        refreshServices();
      }
    } else {
      const { data, error } = await supabase.from('services').insert(serviceData).select().single();
      if (error) {
        showError(t('error_saving_service'));
      } else {
        showSuccess(t('service_saved_successfully'));
        if (data && session?.user.id) {
          await supabase.from('audit_logs').insert({ user_id: session.user.id, action: 'service_created', details: { service_id: data.id, name: values.name } });
        }
        refreshServices();
      }
    }

    setIsSheetOpen(false);
    setSelectedService(null);
    setIsSubmitting(false);
  };

  const confirmDelete = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    
    const serviceName = services.find(s => s.id === serviceToDelete)?.name;
    const { error } = await supabase.from('services').delete().eq('id', serviceToDelete);
    
    if (error) {
      showError(t('error_deleting_service'));
    } else {
      showSuccess(t('service_deleted_successfully'));
      if (session?.user.id) {
        await supabase.from('audit_logs').insert({ user_id: session.user.id, action: 'service_deleted', details: { service_id: serviceToDelete, name: serviceName } });
      }
      refreshServices();
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
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
                <TableHead className="w-[60px]">Ordre</TableHead>
                <TableHead>{t('service')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service, index) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="flex flex-col items-center">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleReorder(index, 'up')} disabled={index === 0}>
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleReorder(index, 'down')} disabled={index === services.length - 1}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{t(service.name.toLowerCase().replace(/ /g, '_'))}</div>
                    <div className="text-sm text-muted-foreground">{service.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('border', statusConfig[service.status as keyof typeof statusConfig]?.className || statusConfig.maintenance.className)}>
                      {statusConfig[service.status as keyof typeof statusConfig]?.text || statusConfig.maintenance.text}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {service.url ? (
                      <span className="text-xs text-green-600">✓ Surveillé</span>
                    ) : (
                      <span className="text-xs text-gray-500">Non surveillé</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu modal={false}>
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
    </motion.div>
  );
};

export default ServiceManager;