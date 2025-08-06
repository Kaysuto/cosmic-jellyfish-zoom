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
      "admin_dashboard": "Tableau de bord Admin",
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
      "service_deleted_successfully": "Service supprimé avec succès."
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
      "time_range_year": "Year",
      "average": "Average",
      "maximum": "Maximum",
      "minimum": "Minimum",
      "Service": "Service",
      "system_wide_incident": "System-wide incident",
      
      // Composants
      "made_with_dyad": "Made with Dyad",
      "made_with_love": "Made with",
      "by_kaysuto": "by Kaysuto Kimiya",
      
      // Messages d'erreur
      "page_not_found": "Oops! Page not found",
      "return_home": "Return to Home",

      // Admin & Auth
      "admin_login": "Admin Login",
      "email_address": "Email address",
      "password": "Password",
      "sign_in": "Sign in",
      "sign_up": "Sign up",
      "already_have_account": "Already have an account? Sign in",
      "dont_have_account": "Don't have an account? Sign up",
      "forgot_password": "Forgot your password?",
      "send_instructions": "Send instructions",
      "admin_dashboard": "Admin Dashboard",
      "logout": "Logout",
      "admin_dashboard_wip": "Management tools for services and incidents will be available here soon.",
      "manage_services": "Manage Services",
      "manage_incidents": "Manage Incidents",
      "create_incident": "Create Incident",
      "edit_incident": "Edit Incident",
      "delete_incident": "Delete Incident",
      "create_service": "Create Service",
      "edit_service": "Edit Service",
      "delete_service": "Delete Service",
      "title": "Title",
      "description": "Description",
      "service": "Service",
      "save": "Save",
      "saving": "Saving...",
      "cancel": "Cancel",
      "delete": "Delete",
      "confirm_delete_title": "Are you sure?",
      "confirm_delete_incident": "This action is irreversible. The incident will be permanently deleted.",
      "confirm_delete_service": "This action is irreversible. The service will be permanently deleted.",
      "no_service_affected": "No specific service",
      "return_to_dashboard": "Return to Dashboard",
      "language_settings": "Language Settings",
      "select_language_desc": "Choose the display language for the entire site.",
      "error_updating_service": "Error updating service status.",
      "service_updated_successfully": "Service status updated successfully.",
      "error_saving_incident": "Error saving incident.",
      "incident_saved_successfully": "Incident saved successfully.",
      "error_deleting_incident": "Error deleting incident.",
      "incident_deleted_successfully": "Incident deleted successfully.",
      "error_saving_service": "Error saving service.",
      "service_saved_successfully": "Service saved successfully.",
      "error_deleting_service": "Error deleting service.",
      "service_deleted_successfully": "Service deleted successfully."
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Options de détection
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;