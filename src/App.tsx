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
import Admin from "./pages/Admin";
import Settings from "./pages/admin/Settings";
import Profile from "./pages/admin/Profile";
import { ThemeProvider } from "@/components/theme-provider";
import MainLayout from "@/components/layout/MainLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useEffect } from "react";
import { useAudioStore } from "./stores/audioStore";
import { useTranslation } from "react-i18next";

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

        // Vérifier si un index est déjà dans la session
        const savedIndex = sessionStorage.getItem('audioPlayerTrackIndex');
        if (savedIndex === null) {
          // Si non, choisir une nouvelle piste aléatoire
          const randomTrackIndex = Math.floor(Math.random() * tracks.length);
          setCurrentTrackIndex(randomTrackIndex);
        } else {
          // Si oui, s'assurer qu'il est valide et le définir (déjà fait dans le store initial)
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
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/settings" element={<Settings />} />
                    <Route path="/admin/profile" element={<Profile key={i18n.language} />} />
                  </Route>
                </Route>
                <Route path="/login" element={<Login key={i18n.language} />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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