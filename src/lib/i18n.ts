import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  fr: {
    translation: {
      // Navigation & common
      home: "Accueil",
      status: "Statut",
      admin: "Admin",
      login: "Connexion",
      settings: "Paramètres",
      profile: "Profil",
      return_home: "Retour à l'accueil",
      open_menu: "Ouvrir le menu",
      cancel: "Annuler",
      save: "Enregistrer",
      saving: "Enregistrement...",
      delete: "Supprimer",

      // Footer / Language
      language_fr: "Français",
      language_en: "English",
      made_with_love: "Créé avec",
      by_kaysuto: "par Kaysuto Kimiya",

      // Audio player
      no_tracks_available: "Aucune piste disponible",
      track_loading: "Chargement...",
      volume_label: "Volume : {{volume}}%",

      // Avatar / profile
      avatar_updated_successfully: "Avatar mis à jour avec succès !",
      avatar_deleted_successfully: "Avatar supprimé avec succès.",
      delete_avatar_title: "Supprimer l'avatar ?",
      delete_avatar_desc:
        "Cette action est irréversible. Votre avatar sera supprimé et remplacé par l'image par défaut.",
      error_deleting_avatar: "Erreur lors de la suppression de l'avatar",
      change_avatar: "Modifier l'avatar",

      // Navbar / auth
      hello_user: "Bonjour, {{name}}",
      logout: "Déconnexion",
      confirm_logout_title: "Confirmer la déconnexion ?",
      confirm_logout_description:
        "Êtes-vous sûr de vouloir vous déconnecter de votre compte ?",
      discord_online: "{{count}} en ligne",
      open_menu: "Ouvrir le menu",

      // Pages & UI
      welcome: "Statut en temps réel des services Jelly",
      homepage_description:
        "Cette page fournit des informations détaillées sur la disponibilité de nos systèmes. En cas d'incident, vous trouverez ici toutes les mises à jour.",
      view_status: "Voir le statut du système",

      // Status page
      all_systems_operational: "Tous les systèmes sont opérationnels",
      partial_outage: "Panne partielle du système",
      major_outage: "Panne majeure du système",
      services_status: "Statut des services",
      operational: "Opérationnel",
      degraded: "Performances dégradées",
      downtime: "Panne majeure",
      maintenance: "En maintenance",
      uptime: "Disponibilité :",
      uptime_legend: "Disponibilité",
      ping_legend: "Ping (ms)",
      incident_history: "Historique des incidents",
      uptime_history: "Historique de disponibilité",
      no_incidents: "Aucun incident signalé dans les 90 derniers jours.",
      resolved: "Résolu",
      investigating: "En cours d'investigation",
      monitoring: "Surveillance",
      identified: "Identifié",
      updated: "Mis à jour :",
      select_service: "Sélectionner un service",
      loading: "Chargement",
      no_uptime_history: "Aucun historique de disponibilité pour ce service.",

      // Admin labels
      admin_dashboard: "Tableau de bord",
      manage_services: "Gérer les services",
      manage_incidents: "Gérer les incidents",
      manage_maintenance: "Gérer la maintenance",
      manage_users: "Gérer les utilisateurs",
      create_service: "Créer un service",
      edit_service: "Modifier le service",
      delete_service: "Supprimer le service",
      create_incident: "Créer un incident",
      edit_incident: "Modifier l'incident",
      delete_incident: "Supprimer l'incident",
      schedule_maintenance: "Planifier une maintenance",
      edit_maintenance: "Modifier la maintenance",
      delete_maintenance: "Supprimer la maintenance",
      total_services: "Services au total",
      operational_services: "Services opérationnels",
      active_incidents: "Incidents actifs",
      avg_resolution_time: "Tps de résolution moy.",

      // Forms & validation
      title: "Titre",
      description: "Description",
      service: "Service",
      start_time: "Début",
      end_time: "Fin",
      status: "Statut",
      save_changes: "Enregistrer les modifications",
      first_name: "Prénom",
      last_name: "Nom de famille",
      email_address: "Adresse e-mail",
      password: "Mot de passe",
      password_required: "Le mot de passe est requis.",
      invalid_email: "Adresse e-mail invalide.",
      password_too_short: "Le mot de passe doit contenir au moins 6 caractères.",
      password_requirements:
        "Doit contenir une majuscule, une minuscule et un chiffre.",
      passwords_do_not_match: "Les mots de passe ne correspondent pas.",

      // Users
      member_since: "Membre depuis",
      last_update: "Dernière mise à jour",
      role: "Rôle",
      admin_role: "Administrateur",
      user_role: "Utilisateur",
      assign_to: "Assigner à",
      select_admin: "Sélectionner un administrateur",
      create_user: "Créer un utilisateur",
      user_deleted_successfully: "Utilisateur supprimé avec succès.",
      error_deleting_user: "Erreur lors de la suppression de l'utilisateur.",
      error_updating_role: "Erreur lors de la mise à jour du rôle.",
      role_updated_successfully: "Rôle mis à jour avec succès.",
      cannot_edit_self_tooltip:
        "Vous ne pouvez pas modifier votre propre compte depuis cette liste. Allez sur la page Profil.",

      // Settings
      general_settings: "Paramètres généraux",
      general_settings_desc:
        "Gérez les paramètres globaux du site, comme le titre et la langue par défaut.",
      default_language: "Langue par défaut",
      default_language_desc:
        "La langue affichée pour les nouveaux visiteurs ou ceux non connectés.",
      allow_new_registrations: "Autoriser les nouvelles inscriptions",
      allow_new_registrations_desc:
        "Contrôlez si de nouveaux utilisateurs peuvent s'inscrire sur le site.",
      registrations_enabled: "Les inscriptions sont maintenant activées.",
      registrations_disabled: "Les inscriptions sont maintenant désactivées.",
      registrations_are_closed:
        "Les inscriptions sont actuellement fermées. Veuillez contacter un administrateur.",
      settings_updated_successfully: "Paramètres mis à jour avec succès.",
      confirm_global_changes_title: "Confirmer les changements globaux ?",
      confirm_global_changes_desc:
        "Ces modifications affecteront l'ensemble du site pour tous les visiteurs. Êtes-vous sûr de vouloir continuer ?",

      // Auth / Login / Signup / Password reset
      sign_in: "Se connecter",
      sign_up: "S'inscrire",
      already_have_account: "Vous avez déjà un compte ?",
      dont_have_account: "Pas de compte ?",
      forgot_password: "Mot de passe oublié ?",
      send_recovery_link: "Envoyer le lien de réinitialisation",
      back_to_login: "Retour à la connexion",
      access_your_dashboard: "Accédez à votre tableau de bord",
      create_a_new_account: "Créez un nouveau compte",
      reset_password_title: "Réinitialiser le mot de passe",
      reset_password_desc:
        "Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.",
      account_created_check_email:
        "Compte créé — vérifiez votre e-mail pour confirmer votre adresse.",
      password_reset_email_sent:
        "Un e-mail de réinitialisation de mot de passe a été envoyé.",
      invalid_login_credentials: "Identifiants de connexion invalides.",
      email_not_confirmed: "E-mail non confirmé. Vérifiez votre boîte de réception.",
      unexpected_login_error:
        "Erreur inattendue lors de la connexion. Veuillez réessayer.",
      login_successful: "Connexion réussie !",
      email_placeholder: "Votre adresse e-mail",
      password_placeholder: "Votre mot de passe",
      first_name_required: "Le prénom est requis",
      last_name_required: "Le nom est requis",
      loading_session: "Chargement de la session...",
      email_link_expired: "Le lien envoyé par e-mail a expiré.",

      // Update password page
      update_password: "Mettre à jour le mot de passe",
      update_your_password: "Mettez à jour votre mot de passe pour sécuriser votre compte",
      password_updated_successfully: "Mot de passe mis à jour avec succès.",

      // Misc / UI
      page_not_found: "Oups ! Page non trouvée",
      page_not_found_desc:
        "Désolé, la page que vous recherchez semble avoir disparu dans le néant.",
      return_home: "Retour à l'accueil",
      previous: "Précédent",
      next: "Suivant",
      page: "Page",
      actions: "Actions",
      edit: "Modifier",
      back_to_users: "Retour aux utilisateurs",

      // Audit / logs
      audit_logs: "Logs d'audit",
      audit_logs_desc:
        "Consultez les événements importants qui se sont produits dans l'application.",
      date: "Date",
      user: "Utilisateur",
      action: "Action",
      details: "Détails",
      system: "Système",

      // Misc messages used in code
      cannot_edit_self: "Impossible de modifier ce compte ici.",
    },
  },
  en: {
    translation: {
      // Navigation & common
      home: "Home",
      status: "Status",
      admin: "Admin",
      login: "Login",
      settings: "Settings",
      profile: "Profile",
      return_home: "Return Home",
      open_menu: "Open menu",
      cancel: "Cancel",
      save: "Save",
      saving: "Saving...",
      delete: "Delete",

      // Footer / Language
      language_fr: "Français",
      language_en: "English",
      made_with_love: "Created with",
      by_kaysuto: "by Kaysuto Kimiya",

      // Audio player
      no_tracks_available: "No tracks available",
      track_loading: "Loading...",
      volume_label: "Volume: {{volume}}%",

      // Avatar / profile
      avatar_updated_successfully: "Avatar updated successfully!",
      avatar_deleted_successfully: "Avatar deleted successfully.",
      delete_avatar_title: "Delete avatar?",
      delete_avatar_desc:
        "This action is irreversible. Your avatar will be removed and replaced with the default image.",
      error_deleting_avatar: "Error deleting avatar",
      change_avatar: "Change avatar",

      // Navbar / auth
      hello_user: "Hello, {{name}}",
      logout: "Logout",
      confirm_logout_title: "Confirm Logout?",
      confirm_logout_description: "Are you sure you want to log out of your account?",
      discord_online: "{{count}} online",
      open_menu: "Open menu",

      // Pages & UI
      welcome: "Real-time Status of Jelly Services",
      homepage_description:
        "This page provides detailed information about the availability of our systems. In case of an incident, you will find all updates here.",
      view_status: "View System Status",

      // Status page
      all_systems_operational: "All Systems Operational",
      partial_outage: "Partial System Outage",
      major_outage: "Major System Outage",
      services_status: "Services Status",
      operational: "Operational",
      degraded: "Degraded Performance",
      downtime: "Major Outage",
      maintenance: "Under Maintenance",
      uptime: "Uptime:",
      uptime_legend: "Uptime",
      ping_legend: "Ping (ms)",
      incident_history: "Issue History",
      uptime_history: "Uptime History",
      no_incidents: "No incidents reported in the last 90 days.",
      resolved: "Resolved",
      investigating: "Investigating",
      monitoring: "Monitoring",
      identified: "Identified",
      updated: "Updated:",
      select_service: "Select a service",
      loading: "Loading",
      no_uptime_history: "No uptime history for this service.",

      // Admin labels
      admin_dashboard: "Dashboard",
      manage_services: "Manage Services",
      manage_incidents: "Manage Issues",
      manage_maintenance: "Manage Maintenance",
      manage_users: "Manage Users",
      create_service: "Create Service",
      edit_service: "Edit Service",
      delete_service: "Delete Service",
      create_incident: "Create Issue",
      edit_incident: "Edit Issue",
      delete_incident: "Delete Issue",
      schedule_maintenance: "Schedule Maintenance",
      edit_maintenance: "Edit Maintenance",
      delete_maintenance: "Delete Maintenance",
      total_services: "Total Services",
      operational_services: "Operational Services",
      active_incidents: "Active Issues",
      avg_resolution_time: "Avg. Resolution Time",

      // Forms & validation
      title: "Title",
      description: "Description",
      service: "Service",
      start_time: "Start Time",
      end_time: "End Time",
      status: "Status",
      save_changes: "Save Changes",
      first_name: "First Name",
      last_name: "Last Name",
      email_address: "Email address",
      password: "Password",
      password_required: "Password is required.",
      invalid_email: "Invalid email address.",
      password_too_short: "Password must be at least 6 characters.",
      password_requirements:
        "Must contain an uppercase, a lowercase, and a number.",
      passwords_do_not_match: "Passwords do not match.",

      // Users
      member_since: "Member since",
      last_update: "Last Update",
      role: "Role",
      admin_role: "Administrator",
      user_role: "User",
      assign_to: "Assign to",
      select_admin: "Select an administrator",
      create_user: "Create user",
      user_deleted_successfully: "User deleted successfully.",
      error_deleting_user: "Error deleting user.",
      error_updating_role: "Error updating role.",
      role_updated_successfully: "Role updated successfully.",
      cannot_edit_self_tooltip:
        "You cannot edit your own account from this list. Go to your Profile page.",

      // Settings
      general_settings: "General Settings",
      general_settings_desc:
        "Manage global site settings, such as the title and default language.",
      default_language: "Default Language",
      default_language_desc:
        "The language displayed for new or non-logged-in visitors.",
      allow_new_registrations: "Allow new registrations",
      allow_new_registrations_desc:
        "Control whether new users can sign up on the site.",
      registrations_enabled: "Registrations are now enabled.",
      registrations_disabled: "Registrations are now disabled.",
      registrations_are_closed:
        "Registrations are currently closed. Please contact an administrator.",
      settings_updated_successfully: "Settings updated successfully.",
      confirm_global_changes_title: "Confirm Global Changes?",
      confirm_global_changes_desc:
        "These changes will affect the entire site for all visitors. Are you sure you want to continue?",

      // Auth / Login / Signup / Password reset
      sign_in: "Sign in",
      sign_up: "Sign up",
      already_have_account: "Already have an account?",
      dont_have_account: "Don't have an account?",
      forgot_password: "Forgot password?",
      send_recovery_link: "Send recovery link",
      back_to_login: "Back to login",
      access_your_dashboard: "Access your dashboard",
      create_a_new_account: "Create a new account",
      reset_password_title: "Reset password",
      reset_password_desc:
        "Enter your email address to receive a password reset link.",
      account_created_check_email:
        "Account created — check your email to confirm your address.",
      password_reset_email_sent:
        "A password reset email has been sent.",
      invalid_login_credentials: "Invalid login credentials.",
      email_not_confirmed: "Email not confirmed. Check your inbox.",
      unexpected_login_error:
        "Unexpected error during login. Please try again.",
      login_successful: "Login successful!",
      email_placeholder: "Your email address",
      password_placeholder: "Your password",
      first_name_required: "First name is required",
      last_name_required: "Last name is required",
      loading_session: "Loading session...",
      email_link_expired: "The email link has expired.",

      // Update password page
      update_password: "Update password",
      update_your_password: "Update your password to secure your account",
      password_updated_successfully: "Password updated successfully.",

      // Misc / UI
      page_not_found: "Oops! Page not found",
      page_not_found_desc:
        "Sorry, the page you are looking for seems to have vanished into thin air.",
      return_home: "Return Home",
      previous: "Previous",
      next: "Next",
      page: "Page",
      actions: "Actions",
      edit: "Edit",
      back_to_users: "Back to users",

      // Audit / logs
      audit_logs: "Audit Logs",
      audit_logs_desc: "Review important events that have occurred in the application.",
      date: "Date",
      user: "User",
      action: "Action",
      details: "Details",
      system: "System",

      // Misc messages used in code
      cannot_edit_self: "Cannot edit this account here.",
    },
  },
};

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  fallbackLng: "fr",
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: ["localStorage", "navigator"],
    caches: ["localStorage"],
  },
});

export default i18n;