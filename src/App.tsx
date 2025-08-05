import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLanguageDetection } from "@/hooks/useLanguageDetection";
import Index from "./pages/Index";
import StatusPage from "./pages/Status";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/components/theme-provider";
import MainLayout from "@/components/layout/MainLayout";

const queryClient = new QueryClient();

// Composant wrapper pour la détection de langue
const AppWrapper = () => {
  useLanguageDetection();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/status" element={<StatusPage />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const App = () => (
  <AppWrapper />
);

export default App;