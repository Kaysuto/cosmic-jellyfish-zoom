import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Mail, Shield } from 'lucide-react';

const DmcaPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            Politique DMCA
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Notre engagement envers le respect de la propriété intellectuelle.
          </p>
        </div>

        <div className="space-y-8">
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Shield className="h-6 w-6 text-blue-400" />
                Avis Important
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                Notre plateforme fonctionne comme un index et une base de données de contenu disponible publiquement sur Internet, agissant de manière similaire à Google. <strong>Nous ne stockons ni n'hébergeons aucun fichier vidéo ou média sur nos serveurs.</strong> Notre service se contente de cataloguer les métadonnées et de fournir des liens vers des contenus hébergés par des tiers. Nous n'avons aucun contrôle sur ces services tiers.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <FileText className="h-6 w-6 text-green-400" />
                Notification de Violation de Droits d'Auteur
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground space-y-4">
              <p>
                Si vous êtes titulaire de droits d'auteur et que vous pensez que du matériel disponible via notre service enfreint vos droits, vous pouvez soumettre une notification de violation de droits d'auteur. Votre notification doit inclure les éléments suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Une signature physique ou électronique d'une personne autorisée à agir au nom du titulaire d'un droit exclusif prétendument violé.</li>
                <li>L'identification de l'œuvre protégée par le droit d'auteur qui aurait été violée.</li>
                <li>L'identification du matériel qui est prétendument en infraction et qui doit être retiré, ainsi que des informations raisonnablement suffisantes pour nous permettre de localiser le matériel.</li>
                <li>Des informations raisonnablement suffisantes pour nous permettre de vous contacter, telles qu'une adresse, un numéro de téléphone et, si possible, une adresse e-mail.</li>
                <li>Une déclaration selon laquelle vous estimez de bonne foi que l'utilisation du matériel de la manière incriminée n'est pas autorisée par le titulaire du droit d'auteur, son agent ou la loi.</li>
                <li>Une déclaration selon laquelle les informations contenues dans la notification sont exactes et, sous peine de parjure, que vous êtes autorisé à agir au nom du titulaire d'un droit exclusif prétendument violé.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Mail className="h-6 w-6 text-red-400" />
                Où Envoyer la Notification ?
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                Veuillez envoyer votre notification de violation de droits d'auteur à notre agent désigné à l'adresse suivante :
              </p>
              <p className="text-lg">
                <strong>E-mail :</strong> <a href="mailto:contact@playjelly.fr" className="text-blue-400 hover:underline font-semibold">contact@playjelly.fr</a>
              </p>
              <p>
                Nous examinerons et traiterons toutes les notifications conformes aux exigences ci-dessus.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default DmcaPage;