import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLanguageDetection } from "@/hooks/useLanguageDetection";
import { ThemeProvider } from "@/components/theme-provider";
import MainLayout from "@/components/layout/MainLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import { JellyfinProvider } from "./contexts/JellyfinContext";
import { useEffect, lazy, Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import DebugApp from "@/components/DebugApp";



// Lazy loaded components
const Index = lazy(() => import("./pages/Index"));
const StatusPage = lazy(() => import("./pages/Status"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const ProfileIndex = lazy(() => import("./pages/ProfileIndex"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const Admin = lazy(() => import("./pages/Admin"));
const ServiceManager = lazy(() => import("./components/admin/ServiceManager"));
const IncidentManager = lazy(() => import("./components/admin/IncidentManager"));
const MaintenanceManager = lazy(() => import("./components/admin/MaintenanceManager"));
const UserManager = lazy(() => import("./components/admin/UserManager"));
const EditUserPage = lazy(() => import("./pages/admin/EditUser"));
const LogsPage = lazy(() => import("./pages/admin/Logs"));
const MediaDetailPage = lazy(() => import("./pages/MediaDetail"));
const PersonDetailPage = lazy(() => import("./pages/PersonDetail"));
const CatalogPage = lazy(() => import("./pages/Catalog"));
const FullSectionPage = lazy(() => import("./pages/FullSectionPage"));
const AdminRequestManager = lazy(() => import("./components/admin/AdminRequestManager"));
const DmcaPage = lazy(() => import("./pages/Dmca"));
const AboutPage = lazy(() => import("./pages/About"));
const PrivacyPage = lazy(() => import("./pages/Privacy"));
const SchedulePage = lazy(() => import("./pages/Schedule"));
const UserPublicProfile = lazy(() => import('./pages/UserPublicProfile'));
const Profile = lazy(() => import('./pages/Profile'));
const MyRequestsPage = lazy(() => import('./pages/MyRequests'));
const PlayerPage = lazy(() => import("./pages/PlayerPage"));
const JellyfinAdminPage = lazy(() => import("./pages/admin/Jellyfin"));



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
  try {
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
  } catch (error) {
    console.error('❌ AppStateInitializer: Erreur:', error);
    return <>{children}</>;
  }
};

// Loading component
const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

const App = () => {
  try {
    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
            <TooltipProvider delayDuration={100}>
              <SettingsProvider>
                <AuthProvider>
                  <JellyfinProvider>
                    <AppStateInitializer>
                      <Sonner />
                      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <Suspense fallback={<LoadingSpinner />}>
                          <Routes>
                            <Route path="/debug" element={<DebugApp />} />
                            <Route element={<MainLayout />}>
                              <Route path="/" element={<Index />} />
                              <Route path="/status" element={<StatusPage />} />
                              <Route path="/dmca" element={<DmcaPage />} />
                              <Route path="/about" element={<AboutPage />} />
                              <Route path="/privacy" element={<PrivacyPage />} />
                              <Route path="/schedule" element={<SchedulePage />} />
                              <Route path="/media/:mediaType/:tmdbId" element={<MediaDetailPage />} />
                              <Route path="/person/:personId" element={<PersonDetailPage />} />
                              <Route path="/catalog" element={<CatalogPage />} />
                              <Route path="/discover/:section" element={<FullSectionPage />} />
                              <Route path="/profile/:userId" element={<ProfileIndex />} />
                              <Route path="/profile" element={<Profile />} />

                              {/* Public route for admin-managed requests moved out of /admin */}
                              <Route element={<AdminRoute />}>
                                <Route path="/requests/manage" element={<AdminRequestManager />} />
                              </Route>

                              <Route element={<ProtectedRoute />}>
                                <Route path="/requests" element={<MyRequestsPage />} />
                              </Route>
                            </Route>
                            
                            <Route element={<ProtectedRoute />}>
                              <Route path="/media/:mediaType/:tmdbId/play" element={<PlayerPage />} />
                            </Route>

                            <Route element={<AdminRoute />}>
                              <Route path="/admin" element={<Admin />}>
                                <Route index element={<AdminDashboard />} />
                                <Route path="services" element={<ServiceManager />} />
                                <Route path="incidents" element={<IncidentManager />} />
                                <Route path="maintenance" element={<MaintenanceManager />} />
                                <Route path="users" element={<UserManager />} />
                                <Route path="users/:userId/edit" element={<EditUserPage />} />
                                {/* removed nested admin requests here intentionally */}
                                <Route path="jellyfin" element={<JellyfinAdminPage />} />
                                <Route path="settings" element={<Settings />} />
                                <Route path="logs" element={<LogsPage />} />
                              </Route>
                            </Route>
                            
                            <Route path="/login" element={<Login />} />
                            <Route path="/update-password" element={<UpdatePassword />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </BrowserRouter>
                    </AppStateInitializer>
                  </JellyfinProvider>
                </AuthProvider>
              </SettingsProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('❌ App: Erreur lors du rendu:', error);
    return <DebugApp />;
  }
};

export default App;