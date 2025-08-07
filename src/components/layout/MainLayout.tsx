import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { FooterContent } from "@/components/layout/FooterContent";
import CustomAudioPlayer from "@/components/CustomAudioPlayer"; // Import the CustomAudioPlayer

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Navbar />
      <main className="flex-grow pt-16 flex flex-col">
        <Outlet />
      </main>
      <footer className="w-full bg-gray-900/80">
        <FooterContent />
      </footer>
    </div>
  );
};

export default MainLayout;