import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FranceFlag from '@/components/icons/FranceFlag';
import UKFlag from '@/components/icons/UKFlag';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ExternalLink, MessageCircle } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import logo from '/logo.png';

export const FooterContent = () => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    url: string;
    actionText: string;
    actionColor: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    url: '',
    actionText: '',
    actionColor: ''
  });
  
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);
  
  const changeLanguage = (lang: 'fr' | 'en') => {
    // Éviter l'actualisation complète en utilisant une approche plus douce
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
      // Sauvegarder la langue dans localStorage pour éviter les re-renders
      localStorage.setItem('i18nextLng', lang);
    }
  };

  const handleExternalLink = (e: React.MouseEvent, link: any) => {
    e.preventDefault();
    
    let title = '';
    let description = '';
    let actionText = '';
    let actionColor = '';
    
    switch (link.label) {
      case 'Discord':
        title = t('confirm_discord_title') || 'Rejoindre le serveur Discord ?';
        description = t('confirm_discord_description') || 'Vous allez être redirigé vers Discord pour rejoindre notre communauté. Continuer ?';
        actionText = t('continue_to_discord') || 'Continuer vers Discord';
        actionColor = 'bg-[#5865F2] hover:bg-[#4752C4] text-white border-[#5865F2]';
        break;
      case 'TikTok':
        title = 'Rejoindre TikTok ?';
        description = 'Vous allez être redirigé vers TikTok pour suivre notre compte. Continuer ?';
        actionText = 'Continuer vers TikTok';
        actionColor = 'bg-black hover:bg-gray-800 text-white border-black';
        break;
      default:
        title = 'Lien externe';
        description = `Vous allez être redirigé vers ${link.label}. Continuer ?`;
        actionText = 'Continuer';
        actionColor = 'bg-primary hover:bg-primary/90 text-primary-foreground';
    }
    
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      url: link.href,
      actionText,
      actionColor
    });
  };

  const confirmExternalLink = () => {
    window.open(confirmDialog.url, '_blank', 'noopener,noreferrer');
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const footerLinks = useMemo(() => {
    const navigationTitle = t('navigation');
    const legalTitle = t('legal') || 'Legal';
    const communityTitle = t('community') || 'Community';
    
    return [
      {
        title: navigationTitle,
        links: [
          { label: t('home_nav') || 'Home', href: '/' },
          { label: t('catalog') || 'Catalog', href: '/catalog' },
          { label: t('schedule') || 'Schedule', href: '/schedule' },
          { label: t('status') || 'Status', href: '/status' },
        ]
      },
      {
        title: legalTitle,
        links: [
          { label: t('about_us') || 'About Us', href: '/about' },
          { label: t('privacy_policy') || 'Privacy Policy', href: '/privacy' },
          { label: 'DMCA', href: '/dmca' },
        ]
      },
      {
        title: communityTitle,
        links: [
          { label: 'Discord', href: 'https://discord.gg/jelly', external: true },
          { label: 'TikTok', href: 'https://www.tiktok.com/@playjellyfr', external: true },
        ]
      }
    ];
  }, [t]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <footer className="w-full">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Brand section */}
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-4 space-y-6"
          >
            <div className="flex items-center gap-3">
              <img src={logo} alt="Jelly Logo" className="h-10 w-auto" />
              <div>
                <h3 className="text-xl font-bold text-foreground">{t('jelly_brand')}</h3>
                <p className="text-sm text-muted-foreground">{t('footer_description')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-3 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-accent"
                  >
                    {i18n.language === 'fr' ? (
                      <FranceFlag className="w-4 h-auto mr-2 rounded-sm" />
                    ) : (
                      <UKFlag className="w-4 h-auto mr-2 rounded-sm" />
                    )}
                    {i18n.language === 'fr' ? 'Français' : 'English'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background/95 backdrop-blur-xl border-border/50">
                  <DropdownMenuItem 
                    onClick={() => changeLanguage('fr')} 
                    className="cursor-pointer hover:bg-accent"
                  >
                    <FranceFlag className="w-4 h-auto mr-2 rounded-sm" />
                    Français
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => changeLanguage('en')} 
                    className="cursor-pointer hover:bg-accent"
                  >
                    <UKFlag className="w-4 h-auto mr-2 rounded-sm" />
                    English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>

          {/* Links sections */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {footerLinks.map((section, index) => (
                <motion.div 
                  key={`section-${index}`} 
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    {section.title || `Section ${index + 1}`}
                  </h4>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        {link.external ? (
                          <button
                            onClick={(e) => handleExternalLink(e, link)}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1 group"
                          >
                            {link.label}
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </button>
                        ) : (
                          <Link 
                            to={link.href} 
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1 group"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
          </div>
        </motion.div>
        
        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-border/50"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>&copy; {new Date().getFullYear()} {t('jelly_brand')}. {t('all_rights_reserved')}</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-1">
                {t('made_with_heart')}
              </p>
              <p className="text-xs text-muted-foreground/70">
                React • TypeScript • Tailwind CSS • ShadCN UI • Framer Motion
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Dialog de confirmation pour les liens externes */}
      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmExternalLink}
              className={confirmDialog.actionColor}
            >
              {confirmDialog.actionText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </footer>
  );
};