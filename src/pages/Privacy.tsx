import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

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
        <h1 className="text-4xl font-bold mb-6">Sécurité & Confidentialité</h1>
        <div className="prose prose-invert prose-lg max-w-none text-muted-foreground space-y-6">
          <p>
            Votre vie privée est importante pour nous. Cette politique de confidentialité explique quelles données personnelles nous collectons auprès de vous et comment nous les utilisons.
          </p>

          <h2 className="text-2xl font-semibold text-white">Collecte des informations</h2>
          <p>
            Nous collectons des informations pour fournir et améliorer nos services. Cela inclut :
          </p>
          <ul>
            <li><strong>Informations de compte :</strong> Lorsque vous vous inscrivez, nous collectons votre nom, prénom et adresse e-mail. Votre mot de passe est chiffré et nous n'y avons jamais accès en clair.</li>
            <li><strong>Données d'utilisation :</strong> Nous pouvons collecter des informations sur la manière dont vous utilisez notre service, comme les pages que vous visitez ou les fonctionnalités que vous utilisez, afin d'améliorer l'expérience utilisateur.</li>
            <li><strong>Demandes de contenu :</strong> Lorsque vous faites une demande de média, nous enregistrons cette demande associée à votre compte.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white">Utilisation des informations</h2>
          <p>
            Nous utilisons les informations que nous collectons pour :
          </p>
          <ul>
            <li>Fournir, exploiter et maintenir notre service.</li>
            <li>Améliorer, personnaliser et développer notre service.</li>
            <li>Communiquer avec vous, notamment pour le support client ou pour vous informer des mises à jour.</li>
            <li>Assurer la sécurité de notre plateforme et prévenir les abus.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white">Partage des informations</h2>
          <p>
            Nous ne vendons, n'échangeons ni ne louons vos informations personnelles à des tiers. Votre confiance est notre priorité. Les données ne sont utilisées qu'en interne pour le bon fonctionnement du service.
          </p>

          <h2 className="text-2xl font-semibold text-white">Sécurité des données</h2>
          <p>
            Nous mettons en œuvre une variété de mesures de sécurité pour maintenir la sécurité de vos informations personnelles. Nous utilisons le chiffrement (HTTPS) pour protéger les données transmises et nos bases de données sont sécurisées avec des politiques d'accès strictes.
          </p>

          <h2 className="text-2xl font-semibold text-white">Vos droits</h2>
          <p>
            Conformément à la réglementation, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ces droits en nous contactant à l'adresse e-mail ci-dessous.
          </p>

          <h2 className="text-2xl font-semibold text-white">Contact</h2>
          <p>
            Pour toute question relative à cette politique de confidentialité, veuillez nous contacter à : <a href="mailto:contact@playjelly.fr" className="text-blue-400 hover:underline">contact@playjelly.fr</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPage;