import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traductions
const resources = {
  fr: {
    translation: {
      // Navigation
      "home": "Accueil",
      "status": "Statut",
      "admin": "Admin",
      "login": "Connexion",
      "settings": "Paramètres",
      
      // Page d'accueil
      "welcome": "Statut en temps réel des services Jelly",
      "homepage_description": "Cette page fournit des informations détaillées sur la disponibilité de nos systèmes. En cas d'incident, vous trouverez ici toutes les mises à jour.",
      "view_status": "Voir le statut du système",
      
      // Page de statut
      "status_title": "Statut des services",
      "all_systems_operational": "Tous les systèmes sont opérationnels",
      "partial_outage": "Panne partielle du système",
      "major_outage": "Panne majeure du système",
      "last_updated": "Dernière mise à jour :",
      "services_status": "Statut des services",
      "operational": "Opérationnel",
      "degraded": "Performances dégradées",
      "downtime": "Panne majeure",
      "maintenance": "En maintenance",
      "uptime": "Disponibilité :",
      "uptime_legend": "Disponibilité",
      "incident_history": "Historique des incidents",
      "uptime_history": "Historique de disponibilité",
      "no_incidents": "Aucun incident signalé dans les 90 derniers jours.",
      "resolved": "Résolu",
      "investigating": "En cours d'investigation",
      "monitoring": "Surveillance",
      "identified": "Identifié",
      "updated": "Mis à jour :",
      "all_systems_operational_description": "Cette page montre l'état actuel de tous les services Jelly. Si vous rencontrez des problèmes, veuillez consulter cette page pour les mises à jour.",
      "systems_issues_description": "Nous rencontrons actuellement des problèmes avec certains de nos services. Veuillez consulter cette page pour suivre notre progression.",
      "streaming_service": "Service de streaming principal",
      "accounts_service": "Gestion des comptes utilisateurs",
      "vod_service": "Demande de films et séries",
      "select_service": "Sélectionner un service",
      "loading": "Chargement",
      "no_uptime_history": "Aucun historique de disponibilité pour ce service.",
      "time_range_day": "Jour",
      "time_range_week": "Semaine",
      "time_range_month": "Mois",
      "time_range_year": "Année",
      "average": "Moyenne",
      "maximum": "Maximum",
      "minimum": "Minimum",
      "Service": "Service",
      "system_wide_incident": "Incident général",
      "url_monitoring": "URL de surveillance",
      "no_url_provided": "Aucune URL fournie",
      "scheduled_maintenance": "Maintenance planifiée",
      "all_services": "Tous les services",
      
      // Composants
      "made_with_dyad": "Fait avec Dyad",
      "made_with_love": "Créé avec",
      "by_kaysuto": "par Kaysuto Kimiya",
      
      // Messages d'erreur
      "page_not_found": "Oups ! Page non trouvée",
      "return_home": "Retour à l'accueil",

      // Admin & Auth
      "admin_login": "Connexion Administrateur",
      "email_address": "Adresse e-mail",
      "password": "Mot de passe",
      "sign_in": "Se connecter",
      "sign_up": "S'inscrire",
      "already_have_account": "Vous avez déjà un compte ? Connectez-vous",
      "dont_have_account": "Pas de compte ? Inscrivez-vous",
      "forgot_password": "Mot de passe oublié ?",
      "send_instructions": "Envoyer les instructions",
      "admin_dashboard": "Tableau de bord",
      "logout": "Déconnexion",
      "admin_dashboard_wip": "Les outils de gestion des services et des incidents seront bientôt disponibles ici.",
      "manage_services": "Gérer les services",
      "manage_incidents": "Gérer les incidents",
      "manage_maintenance": "Gérer la maintenance",
      "create_incident": "Créer un incident",
      "edit_incident": "Modifier l'incident",
      "delete_incident": "Supprimer l'incident",
      "create_service": "Créer un service",
      "edit_service": "Modifier le service",
      "delete_service": "Supprimer le service",
      "schedule_maintenance": "Planifier une maintenance",
      "edit_maintenance": "Modifier la maintenance",
      "delete_maintenance": "Supprimer la maintenance",
      "title": "Titre",
      "description": "Description",
      "service": "Service",
      "start_time": "Début",
      "end_time": "Fin",
      "save": "Enregistrer",
      "saving": "Enregistrement...",
      "cancel": "Annuler",
      "delete": "Supprimer",
      "confirm_delete_title": "Êtes-vous sûr ?",
      "confirm_delete_incident": "Cette action est irréversible. L'incident sera supprimé définitivement.",
      "confirm_delete_service": "Cette action est irréversible. Le service sera supprimé définitivement.",
      "confirm_delete_maintenance": "Cette action est irréversible. La maintenance sera supprimée définitivement.",
      "no_service_affected": "Aucun service spécifique",
      "return_to_dashboard": "Retour au tableau de bord",
      "language_settings": "Paramètres de langue",
      "select_language_desc": "Choisissez la langue d'affichage pour l'ensemble du site.",
      "error_updating_service": "Erreur lors de la mise à jour du service.",
      "service_updated_successfully": "Statut du service mis à jour.",
      "error_saving_incident": "Erreur lors de l'enregistrement de l'incident.",
      "incident_saved_successfully": "Incident enregistré avec succès.",
      "error_deleting_incident": "Erreur lors de la suppression de l'incident.",
      "incident_deleted_successfully": "Incident supprimé avec succès.",
      "error_saving_service": "Erreur lors de l'enregistrement du service.",
      "service_saved_successfully": "Service enregistré avec succès.",
      "error_deleting_service": "Erreur lors de la suppression du service.",
      "service_deleted_successfully": "Service supprimé avec succès.",
      "error_saving_maintenance": "Erreur lors de l'enregistrement de la maintenance.",
      "maintenance_saved_successfully": "Maintenance enregistrée avec succès.",
      "error_deleting_maintenance": "Erreur lors de la suppression de la maintenance.",
      "maintenance_deleted_successfully": "Maintenance supprimée avec succès.",
      "personal_information": "Informations personnelles",
      "update_your_personal_information": "Mettez à jour votre nom et prénom.",
      "first_name": "Prénom",
      "last_name": "Nom de famille",
      "save_changes": "Enregistrer les modifications",
      "change_email": "Changer l'adresse e-mail",
      "update_your_email_address": "Un e-mail de confirmation sera envoyé à votre nouvelle adresse.",
      "update_email": "Mettre à jour l'e-mail",
      "change_password": "Changer le mot de passe",
      "update_your_password": "Assurez-vous d'utiliser un mot de passe sécurisé.",
      "new_password": "Nouveau mot de passe",
      "confirm_new_password": "Confirmer le nouveau mot de passe",
      "update_password": "Mettre à jour le mot de passe",
      "first_name_required": "Le prénom est requis.",
      "last_name_required": "Le nom de famille est requis.",
      "invalid_email": "Adresse e-mail invalide.",
      "password_too_short": "Le mot de passe doit contenir au moins 6 caractères.",
      "passwords_do_not_match": "Les mots de passe ne correspondent pas.",
      "error_updating_profile": "Erreur lors de la mise à jour du profil.",
      "profile_updated_successfully": "Profil mis à jour avec succès.",
      "error_updating_email": "Erreur lors de la mise à jour de l'e-mail.",
      "email_update_confirmation_sent": "E-mail de confirmation envoyé. Veuillez vérifier votre nouvelle boîte de réception.",
      "error_updating_password": "Erreur lors de la mise à jour du mot de passe.",
      "password_updated_successfully": "Mot de passe mis à jour avec succès.",
      "role": "Rôle",
      "admin_role": "Administrateur",
      "user_role": "Utilisateur",
      "member_since": "Membre depuis",
      "assign_to": "Assigner à",
      "select_admin": "Sélectionner un administrateur",
      "total_services": "Services au total",
      "operational_services": "Services opérationnels",
      "active_incidents": "Incidents actifs",
      "avg_resolution_time": "Tps de résolution moy.",
      "actions": "Actions",
      "edit": "Modifier",
      "edit_service_desc": "Modifiez les détails de ce service ci-dessous.",
      "create_service_desc": "Remplissez<dyad-problem-report summary="10 problems">
<problem file="src/components/admin/MaintenanceManager.tsx" line="135" column="22" code="2304">Cannot find name 'DropdownMenu'.</problem>
<problem file="src/components/admin/MaintenanceManager.tsx" line="136" column="24" code="2304">Cannot find name 'DropdownMenuTrigger'.</problem>
<problem file="src/components/admin/MaintenanceManager.tsx" line="140" column="25" code="2304">Cannot find name 'DropdownMenuTrigger'.</problem>
<problem file="src/components/admin/MaintenanceManager.tsx" line="141" column="24" code="2304">Cannot find name 'DropdownMenuContent'.</problem>
<problem file="src/components/admin/MaintenanceManager.tsx" line="142" column="26" code="2304">Cannot find name 'DropdownMenuItem'.</problem>
<problem file="src/components/admin/MaintenanceManager.tsx" line="145" column="27" code="2304">Cannot find name 'DropdownMenuItem'.</problem>
<problem file="src/components/admin/MaintenanceManager.tsx" line="146" column="26" code="2304">Cannot find name 'DropdownMenuItem'.</problem>
<problem file="src/components/admin/MaintenanceManager.tsx" line="149" column="27" code="2304">Cannot find name 'DropdownMenuItem'.</problem>
<problem file="src/components/admin/MaintenanceManager.tsx" line="150" column="25" code="2304">Cannot find name 'DropdownMenuContent'.</problem>
<problem file="src/components/admin/MaintenanceManager.tsx" line="151" column="23" code="2304">Cannot find name 'DropdownMenu'.</problem>
</dyad-problem-report><think>**Analyzing TypeScript Errors**

I'm currently focused on pinpointing the root cause of the TypeScript errors in `MaintenanceManager.tsx`. The "cannot find name" errors are a clear indication of import issues. My next step is to meticulously check the import statements within the file, cross-referencing them with the project's component structure and export declarations. This will help me identify any missing or incorrectly referenced components.


**Resolving Import Issues**

I've identified the root cause of the TypeScript errors: missing imports. Specifically, `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, and `DropdownMenuItem` are not being recognized. I'll add the necessary import statement from the `shadcn/ui` library, mirroring the pattern used in `IncidentManager.tsx`.  This is a quick and straightforward fix.


**Implementing the Fix**

Now that I've added the import statement to `MaintenanceManager.tsx`, the TypeScript errors should be resolved. The fix is straightforward; I've simply added the necessary import for the `shadcn/ui` dropdown components. I'm confident this will eliminate the "cannot find name" errors reported. I'll now proceed to verify the changes by checking for any lingering errors.


**Adding the Necessary Imports**

I've reviewed `MaintenanceManager.tsx` and identified the missing imports for the `DropdownMenu` components, just as anticipated. I've added the following line to the file: `import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';`. This straightforward action addresses the root cause of the compile-time errors. I anticipate successful compilation now.


</think>Of course. I've identified that the errors are due to missing imports for the `DropdownMenu` components. I'll add the necessary import statement to resolve them.

Here are the changes:

<dyad-write path="src/components/admin/MaintenanceManager.tsx" description="Adding missing imports for DropdownMenu components.">
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

    let error;
    if (selectedMaintenance) {
      ({ error } = await supabase.from('scheduled_maintenances').update(maintenanceData).eq('id', selectedMaintenance.id));
    } else {
      ({ error } = await supabase.from('scheduled_maintenances').insert(maintenanceData));
    }

    if (error) {
      showError(t('error_saving_maintenance'));
      console.error(error);
    } else {
      showSuccess(t('maintenance_saved_successfully'));
      setIsSheetOpen(false);
      setSelectedMaintenance(null);
      refreshMaintenances();
    }
    setIsSubmitting(false);
  };

  const confirmDelete = (maintenanceId: string) => {
    setMaintenanceToDelete(maintenanceId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!maintenanceToDelete) return;
    
    const { error } = await supabase.from('scheduled_maintenances').delete().eq('id', maintenanceToDelete);
    
    if (error) {
      showError(t('error_deleting_maintenance'));
    } else {
      showSuccess(t('maintenance_deleted_successfully'));
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
    <>
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
                    <DropdownMenu>
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
    </>
  );
};

export default MaintenanceManager;