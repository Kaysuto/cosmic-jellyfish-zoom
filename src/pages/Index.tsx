import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useTranslation } from "react-i18next";
import { Monitor } from "lucide-react";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Monitor className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            PlayJelly
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            {t('description')}
          </p>
        </div>
        
        <div className="mb-12">
          <Link to="/status">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {t('view_status')}
            </Button>
          </Link>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-blue-300">Notre Mission</h2>
          <p className="text-gray-300">
            Nous nous engageons à fournir une plateforme fiable et performante pour vos expériences numériques. 
            Notre équipe travaille sans relâche pour maintenir une disponibilité maximale de nos services.
          </p>
        </div>
      </div>
      
      <div className="mt-auto pt-12">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;