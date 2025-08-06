import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { MadeWithDyad } from "@/components/made-with-dyad";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Fond animé */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-transparent to-gray-900 opacity-80"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      {/* Contenu principal */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="text-6xl font-bold mb-4 text-red-400">404</h1>
          <p className="text-2xl text-gray-300 mb-6">{t('page_not_found')}</p>
          <p className="text-gray-400 mb-8">
            {t('page_not_found_desc')}
          </p>
          <Link to="/">
            <Button 
              variant="default" 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-transform"
            >
              {t('return_home')}
            </Button>
          </Link>
        </motion.div>
      </main>

      {/* Pied de page */}
      <footer className="relative z-10 w-full bg-transparent">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default NotFound;