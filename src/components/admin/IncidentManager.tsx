import { useState } from 'react';
import { useIncidents, Incident } from '@/hooks/useIncidents';
import { useServices } from '@/hooks/useServices';
import { useAdmins } from '@/hooks/useAdmins';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit, Trash2, MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import IncidentForm, { IncidentFormValues } from './IncidentForm';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useSession } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const IncidentManager = () => {
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const { incidents, loading: incidentsLoading, refreshIncidents } = useIncidents();
  const { services, loading: servicesLoading } = useServices();
  const { admins, loading: adminsLoading } = useAdmins();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<string | null>(null);

  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const statusConfig = {
    investigating: { text: t('investigating'), className: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
    identified: { text: t('identified'), className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
    monitoring: { text: t('monitoring'), className: 'bg-purple-500/20 text-purple-500 border-purple-500/30' },
    resolved: { text: t('resolved'), className: 'bg-green-500/20 text-green-500 border-green-500/30' },
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const incidentToMove = incidents[index];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const incidentToSwap = incidents[swapIndex];

    if (!incidentToMove || !incidentToSwap) return;

    const { error } = await supabase.rpc('swap_incident_positions', {
      incident_id_1: incidentToMove.id,
      incident_id_2: incidentToSwap.id,
    });

    if (error) {
      showError("Erreur lors de la réorganisation.");
    } else {
      refreshIncidents();
    }
  };

  const handleFormSubmit = async (values: IncidentFormValues) => {
    if (!session?.user) {
      showError("Vous devez être connecté pour effectuer cette action.");
      return;
    }

    setIsSubmitting(true);
    const incidentData = {
      ...values,
      title_en: values.title_en || null,
      description_en: values.description_en || null,
      updated_at: new Date().toISOString(),
      position: selectedIncident ? selectedIncident.position : (incidents.length > 0 ? Math.max(...incidents.map(i => i.position)) + 1 : 1),
    };

    if (selectedIncident) {
      const { error } = await supabase.from('incidents').update(incidentData).eq('id', selectedIncident.id);
      if (error) {
        showError(t('error_saving_incident'));
        console.error(error);
      } else {
        showSuccess(t('incident_saved_successfully'));
        if (session?.user.id) {
          await supabase.from('audit_logs').insert({ user_id: session.user.id, action: 'incident_updated', details: { incident_id: selectedIncident.id, title: values.title } });
        }
        refreshIncidents();
      }
    } else {
      const { data, error } = await supabase.from('incidents').insert(incidentData).select().single();
      if (error) {
        showError(t('error_saving_incident'));
        console.error(error);
      } else {
        showSuccess(t('incident_saved_successfully'));
        if (data && session?.user.id) {
          await supabase.from('audit_logs').insert({ user_id: session.user.id, action: 'incident_created', details: { incident_id: data.id, title: values.title } });
        }
        refreshIncidents();
      }
    }

    setIsSheetOpen(false);
    setSelectedIncident(null);
    setIsSubmitting(false);
  };

  const confirmDelete = (incidentId: string) => {
    setIncidentToDelete(incidentId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!incidentToDelete) return;
    
    const incidentTitle = incidents.find(i => i.id === incidentToDelete)?.title;
    const { error } = await supabase.from('incidents').delete().eq('id', incidentToDelete);
    
    if (error) {
      showError(t('error_deleting_incident'));
      console.error(error);
    } else {
      showSuccess(t('incident_deleted_successfully'));
      if (session?.user.id) {
        await supabase.from('audit_logs').insert({ user_id: session.user.id, action: 'incident_deleted', details: { incident_id: incidentToDelete, title: incidentTitle } });
      }
      refreshIncidents();
    }
    
    setIsDeleteDialogOpen(false);
    setIncidentToDelete(null);
  };

  const openCreateForm = () => {
    setSelectedIncident(null);
    setIsSheetOpen(true);
  };

  const openEditForm = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsSheetOpen(true);
  };

  const loading = incidentsLoading || servicesLoading || adminsLoading;

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('manage_incidents')}</CardTitle>
          <Button onClick={openCreateForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('create_incident')}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Ordre</TableHead>
                <TableHead>{t('title')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('service')}</TableHead>
                <TableHead>{t('last_updated')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident, index) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    <div className="flex flex-col items-center">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleReorder(index, 'up')} disabled={index === 0}>
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleReorder(index, 'down')} disabled={index === incidents.length - 1}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{incident.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('border', statusConfig[incident.status].className)}>
                      {statusConfig[incident.status].text}
                    </Badge>
                  </TableCell>
                  <TableCell>{incident.services ? t(incident.services.name.toLowerCase().replace(/ /g, '_')) : t('system_wide_incident')}</TableCell>
                  <TableCell>{format(new Date(incident.updated_at), 'PP', { locale: currentLocale })}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditForm(incident)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>{t('edit')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDelete(incident.id)} className="text-destructive">
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
            <SheetTitle>{selectedIncident ? t('edit_incident') : t('create_incident')}</SheetTitle>
            <SheetDescription>
              {selectedIncident ? t('edit_incident_desc') : t('create_incident_desc')}
            </SheetDescription>
          </SheetHeader>
          <IncidentForm
            incident={selectedIncident}
            services={services}
            admins={admins}
            currentUserId={session!.user.id}
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
            <AlertDialogDescription>{t('confirm_delete_incident')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIncidentToDelete(null)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default IncidentManager;