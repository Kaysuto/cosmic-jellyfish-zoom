import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Monitor, Zap } from "lucide-react";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="relative flex-grow flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-gray-900 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:32px_32px]"></div>

      <div className="text-center max-w-3xl space-y-8 animate-fade-in-up p-4" style={{ animationDelay: '0.2s' }}>
        
        <div className="inline-block">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/20 hover:scale-105 transition-transform duration-300">
            <Monitor className="h-12 w-12 text-white" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-b from-gray-50 to-gray-400 bg-clip-text text-transparent">
          Jelly
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          {t('description')}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/status">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
            >
              <Zap className="mr-2 h-5 w-5" />
              {t('view_status')}
            </Button>
          </Link>
        </div>
        
        <div className="pt-8">
          <h2 className="text-lg font-semibold tracking-wide text-blue-400 uppercase">{t('our_mission')}</h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            {t('mission_description')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;