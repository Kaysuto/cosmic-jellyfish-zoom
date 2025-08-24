import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLanguageDetection } from "@/hooks/useLanguageDetection";
import Index from "./pages/Index";
import StatusPage from "./pages/Status";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import Settings from "./pages/admin/Settings";
import Profile from "./pages/Profile";
import UpdatePassword from "./pages/UpdatePassword";
import { ThemeProvider } from "@/components/theme-provider";
import MainLayout from "@/components/layout/MainLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import { useEffect } from "react";
import Admin from "./pages/Admin";
import ServiceManager from "@/components/admin/ServiceManager";
import IncidentManager from "@/components/admin/IncidentManager";
import MaintenanceManager from "@/components/admin/MaintenanceManager";
import UserManager from "@/components/admin/UserManager";
import EditUserPage from "./pages/admin/EditUser";
import LogsPage from "./pages/admin/Logs";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import MediaDetailPage from "./pages/MediaDetail";
import PersonDetailPage from "./pages/PersonDetail";
import CatalogPage from "./pages/Catalog";
import FullSectionPage from "./pages/FullSectionPage";
import AdminRequestManager from "./components/admin/AdminRequestManager";
import DmcaPage from "./pages/Dmca";
import AboutPage from "./pages/About";
import PrivacyPage from "./pages/Privacy";
import SchedulePage from "./pages/Schedule";
import UserPublicProfile from './pages/UserPublicProfile';
import ProfileOwnerRoute from './components/auth/ProfileOwnerRoute';
import MyRequestsPage from './pages/MyRequests';
import { JellyfinProvider } from "./contexts/JellyfinContext";
import PlayerPage from "./pages/PlayerPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
});

const AppStateInitializer = ({ children }: { children: React.ReactNode }) => {
  const { getSetting, loading: settingsLoading } = useSettings();

  const defaultLanguage = getSetting('default_language', 'fr') as 'fr' | 'en';
  useLanguageDetection(defaultLanguage);

  useEffect(() => {
    if (!settingsLoading) {
      const siteTitle = getSetting('site_title', 'Statut des Services Jelly');
      document.title = siteTitle;
    }
  }, [settingsLoading, getSetting]);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <TooltipProvider delayDuration={100}>
        <SettingsProvider>
          <AuthProvider>
            <JellyfinProvider>
              <AppStateInitializer>
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/status" element={<StatusPage />} />
                      <Route path="/dmca" element={<DmcaPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/privacy" element={<PrivacyPage />} />
                      <Route path="/schedule" element={<SchedulePage />} />
                      <Route path="/media/:type/:id" element={<MediaDetailPage />} />
                      <Route path="/person/:id" element={<PersonDetailPage />} />
                      <Route path="/catalog" element={<CatalogPage />} />
                      <Route path="/catalog/:mediaType" element={<FullSectionPage />} />
                      <Route path="/catalog/jellyfin/:libraryId" element={<FullSectionPage />} />
                      <Route path="/users/:userId" element={<UserPublicProfile />} />
                      <Route element={<ProfileOwnerRoute />}>
                        <Route path="/users/:userId/settings" element={<Profile />} />
                      </Route>
                      <Route element={<ProtectedRoute />}>
                        <Route path="/requests" element={<MyRequestsPage />} />
                      </Route>
                    </Route>
                    
                    <Route element={<ProtectedRoute />}>
                      <Route path="/media/:type/:id/play" element={<PlayerPage />} />
                    </Route>

                    <Route element={<AdminRoute />}>
                      <Route path="/admin" element={<Admin />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="services" element={<ServiceManager />} />
                        <Route path="incidents" element={<IncidentManager />} />
                        <Route path="maintenance" element={<MaintenanceManager />} />
                        <Route path="users" element={<UserManager />} />
                        <Route path="users/:userId/edit" element={<EditUserPage />} />
                        <Route path="requests" element={<AdminRequestManager />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="logs" element={<LogsPage />} />
                      </Route>
                    </Route>
                    
                    <Route path="/login" element={<Login />} />
                    <Route path="/update-password" element={<UpdatePassword />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </AppStateInitializer>
            </JellyfinProvider>
          </AuthProvider>
        </SettingsProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;