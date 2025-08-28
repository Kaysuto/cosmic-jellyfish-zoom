import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Clock, AlertCircle } from 'lucide-react';
import ErrorPage from './ErrorPage';
import { Button } from './button';

interface MaintenanceErrorProps {
  title?: string;
  description?: string;
  estimatedTime?: string;
  contactInfo?: string;
}

const MaintenanceError: React.FC<MaintenanceErrorProps> = ({
  title = "Site en maintenance",
  description = "Nous effectuons actuellement des travaux de maintenance pour améliorer votre expérience.",
  estimatedTime,
  contactInfo
}) => {
  const details = (
    <>
      {estimatedTime && (
        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Clock className="h-4 w-4" />
            <span>Temps estimé : {estimatedTime}</span>
          </div>
        </div>
      )}
      
      {contactInfo && (
        <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <AlertCircle className="h-4 w-4" />
            <span>Contact : {contactInfo}</span>
          </div>
        </div>
      )}
    </>
  );

  return (
    <ErrorPage
      title={title}
      description={description}
      icon={Wrench}
      iconColor="text-blue-500"
      gradientColors={{
        from: "from-blue-500/5",
        via: "via-indigo-500/5",
        to: "to-purple-500/5"
      }}
      badge={{
        text: "Maintenance en cours",
        variant: "outline",
        icon: Wrench
      }}
      details={details}
      showHomeButton={false}
      actions={
        <div className="space-y-3">
          <Button 
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Vérifier si le site est de retour
          </Button>
          
          <div className="text-center">
            <Button 
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              Retour à la page précédente
            </Button>
          </div>
        </div>
      }
    />
  );
};

export default MaintenanceError;
