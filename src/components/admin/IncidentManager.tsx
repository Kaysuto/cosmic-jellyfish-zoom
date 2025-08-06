import { useState } from 'react';
import { useIncidents, Incident } from '@/hooks/useIncidents';
import { useServices } from '@/hooks/useServices';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import IncidentForm, { IncidentFormValues } from './IncidentForm';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

const IncidentManager = () => {
  const { t, i18n } = useTranslation();
  const { incidents, loading: incidentsLoading } = useIncidents();
  const { services, loading: servicesLoading } = useServices();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const handleFormSubmit = async (values: IncidentFormValues) => {
    setIsSubmitting(true);
    const incidentData = {
      ...values,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (selectedIncident) {
      ({ error } = await supabase.from('incidents').update(incidentData).eq('id', selectedIncident.id));
    } else {
      ({ error } = await supabase.from('incidents').insert(incidentData));
    }

    if (error) {
      showError(t('error_saving_incident'));
      console.error(error);
    } else {
      showSuccess(t('incident_saved_successfully'));
      setIsFormOpen(false);
      setSelectedIncident(null);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (incidentId: string) => {
    const { error } = await supabase.from('incidents').delete().eq('id', incidentId);
    if (error) {
      showError(t('error_deleting_incident'));
      console.error(error);
    } else {
      showSuccess(t('incident_deleted_successfully'));
    }
  };

  const openCreateForm = () => {
    setSelectedIncident(null);
    setIsFormOpen(true);
  };

  const openEditForm = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsFormOpen(true);
  };

  const loading = incidentsLoading || servicesLoading;

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('manage_incidents')}</CardTitle>
        <Button onClick={openCreateForm}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('create_incident')}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div key={incident.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <div>
                <p className="font-medium">{incident.title}</p>
                <p className="text-sm text-muted-foreground">
                  {t(incident.status)} - {format(new Date(incident.created_at), 'PP', { locale: currentLocale })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEditForm(incident)}>
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
                      <AlertDialogDescription>{t('confirm_delete_incident')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(incident.id)} className="bg-destructive hover:bg-destructive/90">
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
            <DialogTitle>{selectedIncident ? t('edit_incident') : t('create_incident')}</DialogTitle>
          </DialogHeader>
          <IncidentForm
            incident={selectedIncident}
            services={services}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default IncidentManager;