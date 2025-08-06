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

const queryClient = new QueryClient();

// Composant wrapper pour la détection de langue
const AppWrapper = () => {
  useLanguageDetection();
  const { setTracks, setCurrentTrackIndex } = useAudioStore();

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch('/audio/tracks.json');
        const tracks = await response.json();
        setTracks(tracks);
        // Select a random track after loading
        const randomTrackIndex = Math.floor(Math.random() * tracks.length);
        setCurrentTrackIndex(randomTrackIndex);
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
                    <Route path="/admin/profile" element={<Profile />} />
                  </Route>
                </Route>
                <Route path="/login" element={<Login />} />
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