import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { FooterContent } from "@/components/layout/FooterContent";
import { cn } from "@/lib/utils";

const MainLayout = () => {
  const location = useLocation();
  const isMediaDetailPage = location.pathname.startsWith('/media/');

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Navbar />
      <main className={cn("flex-grow flex flex-col", !isMediaDetailPage && "pt-16")}>
        <Outlet />
      </main>
      <footer className="w-full bg-gray-900/80">
        <FooterContent />
      </footer>
    </div>
  );
};

export default MainLayout;