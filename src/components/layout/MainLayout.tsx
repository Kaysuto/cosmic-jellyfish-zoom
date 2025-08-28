import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { FooterContent } from "@/components/layout/FooterContent";
import { cn } from "@/lib/utils";

const MainLayout = () => {
  const location = useLocation();
  const isMediaDetailPage = location.pathname.startsWith('/media/');
  const isPlayerPage = location.pathname.includes('/play');

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased">
      {/* Navbar avec effet glass moderne */}
      <Navbar />
      
      {/* Main content avec padding responsive réduit */}
      <main className={cn(
        "flex-grow flex flex-col",
        !isMediaDetailPage && !isPlayerPage && "pt-14",
        isPlayerPage && "pt-0" // Pas de padding pour le player
      )}>
        <Outlet />
      </main>
      
      {/* Footer avec design moderne */}
      <footer className="w-full bg-card/50 backdrop-blur-sm border-t border-border/50">
        <FooterContent />
      </footer>
    </div>
  );
};

export default MainLayout;