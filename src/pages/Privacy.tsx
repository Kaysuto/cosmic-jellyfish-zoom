import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Cog, Users, Shield, UserCheck, Mail } from 'lucide-react';

const PrivacyPage = () => {
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
            Sécurité & Confidentialité
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Votre confiance est notre priorité.
          </p>
        </div>

        <div className="space-y-8">
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Database className="h-6 w-6 text-blue-400" />
                Collecte des informations
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground space-y-4">
              <p>
                Nous collectons des informations pour fournir et améliorer nos services. Cela inclut :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Informations de compte :</strong> Lorsque vous vous inscrivez, nous collectons votre nom, prénom et adresse e-mail. Votre mot de passe est chiffré et nous n'y avons jamais accès en clair.</li>
                <li><strong>Données d'utilisation :</strong> Nous pouvons collecter des informations sur la manière dont vous utilisez notre service, comme les pages que vous visitez ou les fonctionnalités que vous utilisez, afin d'améliorer l'expérience utilisateur.</li>
                <li><strong>Demandes de contenu :</strong> Lorsque vous faites une demande de média, nous enregistrons cette demande associée à votre compte.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Cog className="h-6 w-6 text-green-400" />
                Utilisation des informations
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground space-y-4">
              <p>
                Nous utilisons les informations que nous collectons pour :
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fournir, exploiter et maintenir notre service.</li>
                <li>Améliorer, personnaliser et développer notre service.</li>
                <li>Communiquer avec vous, notamment pour le support client ou pour vous informer des mises à jour.</li>
                <li>Assurer la sécurité de notre plateforme et prévenir les abus.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Users className="h-6 w-6 text-yellow-400" />
                Partage des informations
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                Nous ne vendons, n'échangeons ni ne louons vos informations personnelles à des tiers. Votre confiance est notre priorité. Les données ne sont utilisées qu'en interne pour le bon fonctionnement du service.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Shield className="h-6 w-6 text-purple-400" />
                Sécurité des données
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                Nous mettons en œuvre une variété de mesures de sécurité pour maintenir la sécurité de vos informations personnelles. Nous utilisons le chiffrement (HTTPS) pour protéger les données transmises et nos bases de données sont sécurisées avec des politiques d'accès strictes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <UserCheck className="h-6 w-6 text-teal-400" />
                Vos droits
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ces droits en nous contactant à l'adresse e-mail ci-dessous.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Mail className="h-6 w-6 text-red-400" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none text-muted-foreground">
              <p>
                Pour toute question relative à cette politique de confidentialité, veuillez nous contacter à : <a href="mailto:contact@playjelly.fr" className="text-blue-400 hover:underline font-semibold">contact@playjelly.fr</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPage;