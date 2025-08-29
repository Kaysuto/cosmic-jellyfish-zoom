import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { motion } from 'framer-motion';
import { Clapperboard, Smartphone, Users, Play, TrendingUp, Sparkles } from 'lucide-react';
import FeaturedMedia from '@/components/home/FeaturedMedia';
import CatalogSections from '@/components/home/CatalogSections';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DiscordWidget from '@/components/widgets/DiscordWidget';

const Index = () => {
  const { t } = useSafeTranslation();

  const features = [
    {
      icon: <Clapperboard className="h-6 w-6 text-primary" />,
      title: t('home.features.infinite_catalog.title'),
      description: t('home.features.infinite_catalog.description'),
      gradient: "from-blue-500/20 to-purple-500/20"
    },
    {
      icon: <Smartphone className="h-6 w-6 text-primary" />,
      title: t('home.features.available_everywhere.title'),
      description: t('home.features.available_everywhere.description'),
      gradient: "from-green-500/20 to-blue-500/20"
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: t('home.features.active_community.title'),
      description: t('home.features.active_community.description'),
      gradient: "from-purple-500/20 to-pink-500/20"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Fond animé avec gradient moderne */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-center opacity-[0.02] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* Section Hero moderne */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] text-center px-4 pt-8 pb-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
              <Sparkles className="h-3 w-3" />
              <span>{t('home.new_content_badge')}</span>
            </div>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4"
          >
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              {t('home.hero_title')}
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            {t('home.hero_subtitle')}
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
          >
            <Button 
              asChild 
              size="default" 
              className="group relative overflow-hidden bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-6 py-2.5 text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              <Link to="/catalog">
                <span className="relative z-10 flex items-center gap-2 text-white font-semibold">
                  <Play className="h-4 w-4" />
                  {t('home.explore_catalog')}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-hover/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </Button>

            <Button 
              asChild 
              size="default" 
              variant="outline" 
              className="group bg-background/50 backdrop-blur-sm border-border hover:bg-accent hover:text-accent-foreground font-semibold px-6 py-2.5 text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Link to="/status">
                <TrendingUp className="mr-2 h-4 w-4" />
                {t('home.cta_status')}
              </Link>
            </Button>
          </motion.div>

          {/* Statistiques rapides */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            {[
              { label: t('home.stats.movies_series'), value: "10,000+", icon: Clapperboard },
              { label: t('home.stats.active_users'), value: "100+", icon: Users },
              { label: t('home.stats.new_content_month'), value: "100+", icon: TrendingUp }
            ].map((stat, index) => (
              <div key={index} className="text-center p-3 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
                <stat.icon className="h-5 w-5 text-primary mx-auto mb-1.5" />
                <div className="text-lg font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Section Fonctionnalités avec design moderne */}
      <section className="relative z-10 w-full py-16 bg-gradient-to-b from-background to-card/20">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
              {t('home.features.title')}
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border border-border/50 hover:border-border transition-all duration-300 h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <CardHeader className="relative z-10 text-center pb-3">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 text-center">
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Section Médias en vedette */}
      <section className="relative z-10 w-full py-16 bg-card/20">
        <FeaturedMedia />
      </section>

      {/* Section Sections du Catalogue */}
      <section className="relative z-10 w-full py-16">
        <CatalogSections />
      </section>

      {/* Section Communauté */}
      <section className="relative z-10 w-full py-16 bg-gradient-to-t from-background to-card/20">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
              {t('home.community.title')}
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              {t('home.community.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="w-full max-w-2xl">
              <DiscordWidget />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;