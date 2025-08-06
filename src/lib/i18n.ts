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
      "create_incident": "Créer un incident",
      "edit_incident": "Modifier l'incident",
      "delete_incident": "Supprimer l'incident",
      "create_service": "Créer un service",
      "edit_service": "Modifier le service",
      "delete_service": "Supprimer le service",
      "title": "Titre",
      "description": "Description",
      "service": "Service",
      "save": "Enregistrer",
      "saving": "Enregistrement...",
      "cancel": "Annuler",
      "delete": "Supprimer",
      "confirm_delete_title": "Êtes-vous sûr ?",
      "confirm_delete_incident": "Cette action est irréversible. L'incident sera supprimé définitivement.",
      "confirm_delete_service": "Cette action est irréversible. Le service sera supprimé définitivement.",
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
      "actions": "Actions",
      "edit": "Modifier",
      "edit_service_desc": "Modifiez les détails de ce service ci-dessous.",
      "create_service_desc": "Remplissez les détails pour créer un nouveau service.",
      "edit_incident_desc": "Modifiez les détails de cet incident ci-dessous.",
      "create_incident_desc": "Remplissez les détails pour créer un nouvel incident."
    }
  },
  en: {
    translation: {
      // Navigation
      "home": "Home",
      "status": "Status",
      "admin": "Admin",
      "login": "Login",
      "settings": "Settings",
      
      // Page d'accueil
      "welcome": "Real-time status of Jelly services",
      "homepage_description": "This page provides detailed information on our systems' availability. In case of an incident, you will find all updates here.",
      "view_status": "View System Status",
      
      // Page de statut
      "status_title": "Service Status",
      "all_systems_operational": "All Systems Operational",
      "partial_outage": "Partial System Outage",
      "major_outage": "Major System Outage",
      "last_updated": "Last updated:",
      "services_status": "Services Status",
      "operational": "Operational",
      "degraded": "Degraded Performance",
      "downtime": "Major Outage",
      "maintenance": "Under Maintenance",
      "uptime": "Uptime:",
      "uptime_legend": "Uptime",
      "incident_history": "Incident History",
      "uptime_history": "Uptime History",
      "no_incidents": "No incidents reported in the past 90 days.",
      "resolved": "Resolved",
      "investigating": "Investigating",
      "monitoring": "Monitoring",
      "identified": "Identified",
      "updated": "Updated:",
      "all_systems_operational_description": "This page shows the current status of all Jelly services. If you're experiencing issues, please check this page for updates.",
      "systems_issues_description": "We are currently experiencing issues with some of our services. Please check this page for updates on our progress.",
      "streaming_service": "Main streaming service",
      "accounts_service": "User accounts management",
      "vod_service": "Movie and series requests",
      "select_service": "Select a service",
      "loading": "Loading",
      "no_uptime_history": "No uptime history for this service.",
      "time_range_day": "Day",
      "time_range_week": "Week",
      "time_range_month": "Month",
      "time_range_year": "<dyad-problem-report summary="81 problems">
<problem file="src/pages/Status.tsx" line="103" column="1" code="1128">Declaration or statement expected.</problem>
<problem file="src/pages/Status.tsx" line="105" column="2" code="17008">JSX element 'dyad-write' has no corresponding closing tag.</problem>
<problem file="src/pages/Status.tsx" line="111" column="5" code="1005">'}' expected.</problem>
<problem file="src/pages/Status.tsx" line="119" column="1" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/pages/Status.tsx" line="121" column="32" code="1382">Unexpected token. Did you mean `{'&gt;'}` or `&amp;gt;`?</problem>
<problem file="src/pages/Status.tsx" line="122" column="3" code="1109">Expression expected.</problem>
<problem file="src/pages/Status.tsx" line="122" column="51" code="1003">Identifier expected.</problem>
<problem file="src/pages/Status.tsx" line="122" column="53" code="1382">Unexpected token. Did you mean `{'&gt;'}` or `&amp;gt;`?</problem>
<problem file="src/pages/Status.tsx" line="125" column="47" code="1382">Unexpected token. Did you mean `{'&gt;'}` or `&amp;gt;`?</problem>
<problem file="src/pages/Status.tsx" line="126" column="21" code="1005">'}' expected.</problem>
<problem file="src/pages/Status.tsx" line="133" column="75" code="1005">'}' expected.</problem>
<problem file="src/pages/Status.tsx" line="135" column="5" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/pages/Status.tsx" line="136" column="30" code="1005">'}' expected.</problem>
<problem file="src/pages/Status.tsx" line="137" column="5" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/pages/Status.tsx" line="139" column="3" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/pages/Status.tsx" line="141" column="17" code="1382">Unexpected token. Did you mean `{'&gt;'}` or `&amp;gt;`?</problem>
<problem file="src/pages/Status.tsx" line="142" column="20" code="1005">'}' expected.</problem>
<problem file="src/pages/Status.tsx" line="144" column="75" code="1003">Identifier expected.</problem>
<problem file="src/pages/Status.tsx" line="144" column="77" code="1005">'...' expected.</problem>
<problem file="src/pages/Status.tsx" line="144" column="81" code="1005">',' expected.</problem>
<problem file="src/pages/Status.tsx" line="144" column="96" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/pages/Status.tsx" line="144" column="97" code="1382">Unexpected token. Did you mean `{'&gt;'}` or `&amp;gt;`?</problem>
<problem file="src/pages/Status.tsx" line="144" column="101" code="1382">Unexpected token. Did you mean `{'&gt;'}` or `&amp;gt;`?</problem>
<problem file="src/pages/Status.tsx" line="145" column="56" code="1005">'}' expected.</problem>
<problem file="src/pages/Status.tsx" line="148" column="9" code="1109">Expression expected.</problem>
<problem file="src/pages/Status.tsx" line="149" column="38" code="1382">Unexpected token. Did you mean `{'&gt;'}` or `&amp;gt;`?</problem>
<problem file="src/pages/Status.tsx" line="150" column="34" code="1382">Unexpected token. Did you mean `{'&gt;'}` or `&amp;gt;`?</problem>
<problem file="src/pages/Status.tsx" line="152" column="7" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/pages/Status.tsx" line="153" column="9" code="1109">Expression expected.</problem>
<problem file="src/pages/Status.tsx" line="154" column="38" code="1382">Unexpected token. Did you mean `{'&gt;'}` or `&amp;gt;`?</problem>
<problem file="src/pages/Status.tsx" line="154" column="86" code="1382">Unexpected token. Did you mean `{'&gt;'}` or `&amp;gt;`?</problem>
<problem file="src/pages/Status.tsx" line="155" column="7" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/pages/Status.tsx" line="156" column="9" code="1109">Expression expected.</problem>
<problem file="src/pages/Status.tsx" line="156" column="55" code="17008">JSX element 'Service' has no corresponding closing tag.</problem>
<problem file="src/pages/Status.tsx" line="158" column="38" code="1382">Unexpected token. Did you mean `{'&gt;'}` or `&amp;gt;`?</problem>
<problem file="src/pages/Status.tsx" line="158" column="66" code="1382">Unexpected token. Did you mean `{'&gt;'}` or `&amp;gt;`?</problem>
<problem file="src/pages/Status.tsx" line="159" column="7" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/pages/Status.tsx" line="160" column="5" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/pages/Status.tsx" line="167" column="16" code="1005">'}' expected.</problem>
<problem file="src/pages/Status.tsx" line="170" column="9" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/pages/Status.tsx" line="175" column="16" code="1382">Unexpected token. Did you mean `{'&gt;'}` or `&amp;gt;`?</problem>
<problem file="src/pages/Status.tsx" line="176" column="38" code="1005">'}' expected.</problem>
<problem file="src/pages/Status.tsx" line="177" column="5" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/pages/Status.tsx" line="178" column="3" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/pages/Status.tsx" line="181" column="43" code="1382">Unexpected token. Did you mean `{'&gt;'}` or `&amp;gt;`?</problem>
<problem file="src/pages/Status.tsx" line="182" column="20" code="1005">'}' expected.</problem>
<problem file="src/pages/Status.tsx" line="183" column="3" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/pages/Status.tsx" line="186" column="1" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/pages/Status.tsx" line="186" column="3" code="1005">'&lt;/' expected.</problem>
<problem file="src/pages/Status.tsx" line="103" column="3" code="2304">Cannot find name 'dyad'.</problem>
<problem file="src/pages/Status.tsx" line="103" column="3" code="2365">Operator '&gt;' cannot be applied to types 'number' and 'Element'.</problem>
<problem file="src/pages/Status.tsx" line="103" column="8" code="2552">Cannot find name 'file'. Did you mean 'File'?</problem>
<problem file="src/pages/Status.tsx" line="105" column="1" code="2339">Property 'dyad-write' does not exist on type 'JSX.IntrinsicElements'.</problem>
<problem file="src/pages/Status.tsx" line="106" column="10" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/pages/Status.tsx" line="106" column="10" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/pages/Status.tsx" line="106" column="31" code="2304">Cannot find name 'useCallback'.</problem>
<problem file="src/pages/Status.tsx" line="107" column="10" code="2304">Cannot find name 'supabase'.</problem>
<problem file="src/pages/Status.tsx" line="108" column="10" code="2304">Cannot find name 'RealtimeChannel'.</problem>
<problem file="src/pages/Status.tsx" line="108" column="10" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/pages/Status.tsx" line="108" column="27" code="2304">Cannot find name 'RealtimePostgresChangesPayload'.</problem>
<problem file="src/pages/Status.tsx" line="111" column="3" code="2304">Cannot find name 'id'.</problem>
<problem file="src/pages/Status.tsx" line="122" column="44" code="2693">'Service' only refers to a type, but is being used as a value here.</problem>
<problem file="src/pages/Status.tsx" line="126" column="5" code="2304">Cannot find name 'setLoading'.</problem>
<problem file="src/pages/Status.tsx" line="127" column="13" code="2304">Cannot find name 'data'.</problem>
<problem file="src/pages/Status.tsx" line="127" column="13" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/pages/Status.tsx" line="127" column="19" code="2552">Cannot find name 'error'. Did you mean 'Error'?</problem>
<problem file="src/pages/Status.tsx" line="133" column="69" code="2304">Cannot find name 'error'.</problem>
<problem file="src/pages/Status.tsx" line="136" column="7" code="2304">Cannot find name 'setServices'.</problem>
<problem file="src/pages/Status.tsx" line="136" column="19" code="2304">Cannot find name 'data'.</problem>
<problem file="src/pages/Status.tsx" line="142" column="5" code="2304">Cannot find name 'fetchServices'.</problem>
<problem file="src/pages/Status.tsx" line="144" column="78" code="2304">Cannot find name 'key'.</problem>
<problem file="src/pages/Status.tsx" line="145" column="48" code="2304">Cannot find name 'payload'.</problem>
<problem file="src/pages/Status.tsx" line="156" column="55" code="2693">'Service' only refers to a type, but is being used as a value here.</problem>
<problem file="src/pages/Status.tsx" line="176" column="7" code="2304">Cannot find name 'supabase'.</problem>
<problem file="src/pages/Status.tsx" line="176" column="30" code="2304">Cannot find name 'channel'.</problem>
<problem file="src/pages/Status.tsx" line="182" column="5" code="2304">Cannot find name 'fetchServices'.</problem>
<problem file="src/pages/Status.tsx" line="185" column="12" code="2304">Cannot find name 'services'.</problem>
<problem file="src/pages/Status.tsx" line="185" column="12" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/pages/Status.tsx" line="185" column="12" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/pages/Status.tsx" line="185" column="22" code="2304">Cannot find name 'loading'.</problem>
<problem file="src/pages/Status.tsx" line="185" column="31" code="2304">Cannot find name 'refreshServices'.</problem>
</dyad-problem-report>It seems like the previous response might have been incomplete or had some residual issues. I've carefully reviewed the TypeScript errors you provided and made the necessary corrections.

The primary issues were related to:

*   **Incorrect JSX syntax**: The presence of `<dyad-write>` and `</dyad-file>` tags within the TypeScript code was causing syntax errors. These are not valid JSX or TypeScript constructs.
*   **Missing imports**: Some necessary types and functions were not imported correctly.
*   **Type mismatches**: There were instances where types were not correctly inferred or used.
*   **Scope issues**: Variables and functions were not always accessible in the correct scope.

Here are the corrected files:

<dyad-write path="src/pages/Status.tsx" description="Fixing TypeScript errors in Status page and useServices hook">
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

import { useServices, type Service } from '@/hooks/useServices';
import { useIncidents, type Incident } from '@/hooks/useIncidents';

import OverallStatus from '@/components/status/OverallStatus';
import ServicesStatus from '@/components/status/ServicesStatus';
import IncidentHistory from '@/components/status/IncidentHistory';
import UptimeHistory from '@/components/status/UptimeHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Status = () => {
  const { t, i18n } = useTranslation();
  const { services, loading: servicesLoading } = useServices();
  const { incidents, loading: incidentsLoading } = useIncidents();
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const loading = servicesLoading || incidentsLoading;
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  useEffect(() => {
    if (services && services.length > 0) {
      if (!selectedServiceId) {
        setSelectedServiceId(services[0].id);
      }

      const mostRecentUpdate = services.reduce((latest, service) => {
        const serviceDate = new Date(service.updated_at);
        return serviceDate > latest ? serviceDate : latest;
      }, new Date(0));
      setLastUpdated(mostRecentUpdate);
    }
  }, [services, selectedServiceId]);

  const overallStatus = useMemo(() => {
    if (services.length === 0) return 'all_systems_operational';
    const hasDowntime = services.some(s => s.status === 'downtime');
    if (hasDowntime) return 'major_outage';
    const hasDegraded = services.some(s => s.status === 'degraded');
    if (hasDegraded) return 'partial_outage';
    return 'all_systems_operational';
  }, [services]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-24 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-full w-full min-h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 flex-grow flex flex-col"
    >
      <OverallStatus status={overallStatus} lastUpdated={lastUpdated ? `${t('last_updated')} ${formatDistanceToNow(lastUpdated, { addSuffix: true, locale: currentLocale })}` : ''} />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
        <div className="flex flex-col gap-8">
          <ServicesStatus services={services} />
          <UptimeHistory serviceId={selectedServiceId}>
            {services.length > 0 && selectedServiceId && (
              <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder={t('select_service')} />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {t(service.name.toLowerCase().replace(/ /g, '_'))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </UptimeHistory>
        </div>
        
        <IncidentHistory incidents={incidents} />
      </div>
    </motion.div>
  );
};

export default Status;