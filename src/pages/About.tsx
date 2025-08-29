import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { motion } from 'framer-motion';
import { Users, Heart, Rocket, Clapperboard, Code, Database, Globe, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import logo from '/logo.png';

const AboutPage = () => {
  const { t } = useSafeTranslation();

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src={logo} alt="Jelly Logo" className="h-16 w-auto" />
            <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              {t('about_title')}
            </h1>
          </div>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('about_subtitle')}
          </p>
        </div>

        <div className="space-y-8">
          {/* Mission */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center gap-8 p-8 bg-card border border-border rounded-xl shadow-lg"
          >
            <Rocket className="h-16 w-16 text-primary flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('about_mission_title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('about_mission_desc')}
              </p>
            </div>
          </motion.div>

          {/* Projet Passionné */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center gap-8 p-8 bg-card border border-border rounded-xl shadow-lg"
          >
            <Heart className="h-16 w-16 text-destructive flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('about_passion_title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('about_passion_desc')}
              </p>
            </div>
          </motion.div>

          {/* Communauté */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center gap-8 p-8 bg-card border border-border rounded-xl shadow-lg"
          >
            <Users className="h-16 w-16 text-success flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{t('about_community_title')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('about_community_desc')}
              </p>
            </div>
          </motion.div>

          {/* Technologies */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="bg-card border border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  {t('about_frontend_title')}
                </CardTitle>
                <CardDescription>
                  {t('about_frontend_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Tailwind CSS</Badge>
                  <Badge variant="secondary">ShadCN UI</Badge>
                  <Badge variant="secondary">Framer Motion</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  {t('about_services_title')}
                </CardTitle>
                <CardDescription>
                  {t('about_services_desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Jellyfin</Badge>
                  <Badge variant="secondary">TMDB</Badge>
                  <Badge variant="secondary">Supabase</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Disclaimer */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="p-6 bg-muted/30 border border-border/50 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-foreground mb-2">{t('about_legal_title')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('about_legal_desc')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-center mt-16">
          <Link to="/catalog">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-transform duration-300 px-8 py-6 text-lg">
              <Clapperboard className="mr-3 h-6 w-6" />
              {t('about_explore_catalog')}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage;