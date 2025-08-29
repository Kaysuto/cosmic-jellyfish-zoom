import { useState } from 'react';
import { useIncidents } from '@/hooks/useIncidents';
import { useServices } from '@/hooks/useServices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import IncidentForm from './IncidentForm';
import IncidentsTable from './IncidentsTable';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Incident } from '@/types/status';
import { useSession } from '@/contexts/AuthContext';

const IncidentManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { session } = useSession();
  const { incidents, loading: incidentsLoading, refreshIncidents } = useIncidents();
  const { services, loading: servicesLoading } = useServices();

  const handleOpenDialog = (incident: Incident | null = null) => {
    setSelectedIncident(incident);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedIncident(null);
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (selectedIncident) {
        // Update logic
        const { error } = await supabase.functions.invoke('update-incident', {
          body: {
            incidentId: selectedIncident.id,
            title: data.title,
            status: data.status,
            serviceId: data.service_id,
            message: data.update_message,
            userId: session?.user.id,
            authorId: data.admin_id || null,
          }
        });
        if (error) throw error;
        showSuccess('Incident mis à jour avec succès.');
      } else {
        // Create logic
        const { error } = await supabase.functions.invoke('create-incident', {
          body: {
            title: data.title,
            status: data.status,
            serviceId: data.service_id,
            message: data.update_message,
            userId: session?.user.id,
            authorId: data.admin_id || null,
          }
        });
        if (error) throw error;
        showSuccess('Incident créé avec succès.');
      }
      refreshIncidents();
      handleCloseDialog();
    } catch (error: any) {
      showError(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-background/90 to-muted/60 border border-border/50 shadow-lg backdrop-blur-md rounded-xl">
      <CardHeader className="border-b border-border/40 bg-background/80 rounded-t-xl px-6 py-5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <PlusCircle className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Gérer les incidents</CardTitle>
            <CardDescription className="text-muted-foreground">Créer, modifier et suivre les incidents.</CardDescription>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} variant="default" className="btn-primary px-4 py-2 text-base font-semibold shadow-sm">
              <PlusCircle className="mr-2 h-5 w-5" />
              Créer un incident
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>{selectedIncident ? "Modifier l'incident" : "Créer un incident"}</DialogTitle>
            </DialogHeader>
            <IncidentForm
              incident={selectedIncident}
              services={services as any}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <IncidentsTable
          incidents={incidents}
          loading={incidentsLoading || servicesLoading}
          onEdit={handleOpenDialog}
          onRefresh={refreshIncidents}
        />
      </CardContent>
    </Card>
  );
};

export default IncidentManager;