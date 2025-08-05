import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-12 w-12 text-red-400" />
        </div>
        <h1 className="text-6xl font-bold mb-4 text-red-400">404</h1>
        <p className="text-2xl text-gray-300 mb-6">{t('page_not_found')}</p>
        <p className="text-gray-500 mb-8">
          Désolé, la page que vous recherchez semble avoir disparu dans le néant.
        </p>
        <Link to="/">
          <Button 
            variant="default" 
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full"
          >
            {t('return_home')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;