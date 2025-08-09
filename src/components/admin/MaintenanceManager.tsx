import { useState } from 'react';
import { useMaintenances, Maintenance } from '@/hooks/useMaintenances';
import { useServices } from '@/hooks/useServices';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import MaintenanceForm, { MaintenanceFormValues } from './MaintenanceForm';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useSession } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

const MaintenanceManager = () => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const { maintenances, loading: maintenancesLoading, refreshMaintenances } = useMaintenances();
  const { services, loading: servicesLoading } = useServices();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState<string | null>(null);

  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const handleFormSubmit = async (values: MaintenanceFormValues) => {
    if (!session?.user) {
      showError("Vous devez être connecté pour effectuer cette action.");
      return;
    }

    setIsSubmitting(true);
    const maintenanceData = {
      ...values,
      author_id: session.user.id,
      updated_at: new Date().toISOString(),
    };

    if (selectedMaintenance) {
      const { error } = await supabase.from('scheduled_maintenances').update(maintenanceData).eq('id', selectedMaintenance.id);
      if (error) {
        showError(t('error_saving_maintenance'));
        console.error(error);
      } else {
        showSuccess(t('maintenance_saved_successfully'));
        await supabase.from('audit_logs').insert({ user_id: session.user.id, action: 'maintenance_updated', details: { maintenance_id: selectedMaintenance.id, title: values.title } });
        refreshMaintenances();
      }
    } else {
      const { data, error } = await supabase.from('scheduled_maintenances').insert(maintenanceData).select().single();
      if (error) {
        showError(t('error_saving_maintenance'));
        console.error(error);
      } else {
        showSuccess(t('maintenance_saved_successfully'));
        if (data) {
          await supabase.from('audit_logs').insert({ user_id: session.user.id, action: 'maintenance_created', details: { maintenance_id: data.id, title: values.title } });
        }
        refreshMaintenances();
      }
    }

    setIsSheetOpen(false);
    setSelectedMaintenance(null);
    setIsSubmitting(false);
  };

  const confirmDelete = (maintenanceId: string) => {
    setMaintenanceToDelete(maintenanceId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!maintenanceToDelete || !session?.user) return;
    
    const maintenanceTitle = maintenances.find(m => m.id === maintenanceToDelete)?.title;
    const { error } = await supabase.from('scheduled_maintenances').delete().eq('id', maintenanceToDelete);
    
    if (error) {
      showError(t('error_deleting_maintenance'));
    } else {
      showSuccess(t('maintenance_deleted_successfully'));
      await supabase.from('audit_logs').insert({ user_id: session.user.id, action: 'maintenance_deleted', details: { maintenance_id: maintenanceToDelete, title: maintenanceTitle } });
      refreshMaintenances();
    }
    
    setIsDeleteDialogOpen(false);
    setMaintenanceToDelete(null);
  };

  const openCreateForm = () => {
    setSelectedMaintenance(null);
    setIsSheetOpen(true);
  };

  const openEditForm = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setIsSheetOpen(true);
  };

  const loading = maintenancesLoading || servicesLoading;

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-96 w-full" /></CardContent>
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
          <CardTitle>{t('manage_maintenance')}</CardTitle>
          <Button onClick={openCreateForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('schedule_maintenance')}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('title')}</TableHead>
                <TableHead>{t('service')}</TableHead>
                <TableHead>{t('start_time')}</TableHead>
                <TableHead>{t('end_time')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenances.map((maintenance) => (
                <TableRow key={maintenance.id}>
                  <TableCell className="font-medium">{maintenance.title}</TableCell>
                  <TableCell>{maintenance.services ? t(maintenance.services.name.toLowerCase().replace(/ /g, '_')) : t('all_services')}</TableCell>
                  <TableCell>{format(new Date(maintenance.start_time), 'PPpp', { locale: currentLocale })}</TableCell>
                  <TableCell>{format(new Date(maintenance.end_time), 'PPpp', { locale: currentLocale })}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditForm(maintenance)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>{t('edit')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDelete(maintenance.id)} className="text-destructive">
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
        <SheetContent className="sm:max-w-lg w-full">
          <SheetHeader>
            <SheetTitle>{selectedMaintenance ? t('edit_maintenance') : t('schedule_maintenance')}</SheetTitle>
            <SheetDescription>
              {selectedMaintenance ? t('edit_maintenance_desc') : t('schedule_maintenance_desc')}
            </SheetDescription>
          </SheetHeader>
          <MaintenanceForm
            maintenance={selectedMaintenance}
            services={services}
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
            <AlertDialogDescription>{t('confirm_delete_maintenance')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMaintenanceToDelete(null)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default MaintenanceManager;