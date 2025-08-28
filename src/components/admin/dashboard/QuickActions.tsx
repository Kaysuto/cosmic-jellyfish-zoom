import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Plus, AlertTriangle, Calendar, Users, Settings, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const QuickActions = () => {
  const { t } = useTranslation();

  const actions = [
    {
      title: t('manage_incidents'),
      description: t('manage_incidents_desc'),
      icon: AlertTriangle,
      href: '/admin/incidents',
      color: 'from-red-500/20 to-pink-500/10',
      iconColor: 'text-red-500',
      hoverColor: 'hover:bg-red-500/10'
    },
    {
      title: t('manage_maintenance'),
      description: t('manage_maintenance_desc'),
      icon: Calendar,
      href: '/admin/maintenance',
      color: 'from-blue-500/20 to-cyan-500/10',
      iconColor: 'text-blue-500',
      hoverColor: 'hover:bg-blue-500/10'
    },
    {
      title: t('manage_users'),
      description: t('manage_users_desc'),
      icon: Users,
      href: '/admin/users',
      color: 'from-green-500/20 to-emerald-500/10',
      iconColor: 'text-green-500',
      hoverColor: 'hover:bg-green-500/10'
    },
    {
      title: t('settings'),
      description: t('configuration_desc'),
      icon: Settings,
      href: '/admin/settings',
      color: 'from-purple-500/20 to-violet-500/10',
      iconColor: 'text-purple-500',
      hoverColor: 'hover:bg-purple-500/10'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t('quick_actions_title')}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {t('quick_actions_subtitle')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            
            return (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, x: -10, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ 
                  duration: 0.25, 
                  delay: index * 0.05,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ 
                  x: 2, 
                  scale: 1.01,
                  transition: { duration: 0.15, ease: "easeOut" }
                }}
              >
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "w-full justify-start p-4 h-auto group relative overflow-hidden",
                    action.hoverColor
                  )}
                >
                  <Link to={action.href}>
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                      action.color
                    )} />
                    
                    <div className="relative flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg bg-gradient-to-br from-current/10 to-current/5 group-hover:scale-105 transition-transform duration-150",
                        action.iconColor
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-foreground group-hover:text-foreground transition-colors">
                          {action.title}
                        </div>
                        <div className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                          {action.description}
                        </div>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:rotate-90 transition-all duration-150" />
                    </div>
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickActions;