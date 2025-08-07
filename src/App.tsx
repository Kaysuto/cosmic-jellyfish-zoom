import { Toaster } from "@/components/ui/toaster";
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
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import { ThemeProvider } from "@/components/theme-provider";
import MainLayout from "@/components/layout/MainLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import { useEffect } from "react";
import { useAudioStore } from "./stores/audioStore";
import { useTranslation } from "react-i18next";
import Admin from "./pages/Admin";
import ServiceManager from "@/components/admin/ServiceManager";
import IncidentManager from "@/components/admin/IncidentManager";
import MaintenanceManager from "@/components/admin/MaintenanceManager";
import UserManager from "@/components/admin/UserManager";
import EditUserPage from "./pages/admin/EditUser";

const queryClient = new QueryClient();

// Composant wrapper pour la détection de langue
const AppWrapper = () => {
  useLanguageDetection();
  const { setTracks, setCurrentTrackIndex } = useAudioStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch('/audio/tracks.json');
        const tracks = await response.json();
        setTracks(tracks);

        const savedIndex = sessionStorage.getItem('audioPlayerTrackIndex');
        if (savedIndex === null) {
          const randomTrackIndex = Math.floor(Math.random() * tracks.length);
          setCurrentTrackIndex(randomTrackIndex);
        } else {
          const parsedIndex = parseInt(savedIndex, 10);
          if (isNaN(parsedIndex) || parsedIndex >= tracks.length) {
            const randomTrackIndex = Math.floor(Math.random() * tracks.length);
            setCurrentTrackIndex(randomTrackIndex);
          }
        }
      } catch (error) {
        console.error("Failed to fetch audio tracks:", error);
      }
    };

    fetchTracks();
  }, [setTracks, setCurrentTrackIndex]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <TooltipProvider delayDuration={100}>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/status" element={<StatusPage />} />
                  
                  <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Route>

                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<Admin />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="services" element={<ServiceManager />} />
                    <Route path="incidents" element={<IncidentManager />} />
                    <Route path="maintenance" element={<MaintenanceManager />} />
                    <Route path="users" element={<UserManager />} />
                    <Route path="users/:userId/edit" element={<EditUserPage />} />
                  </Route>
                </Route>

                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const App = () => (
  <AppWrapper />
);

export default App;