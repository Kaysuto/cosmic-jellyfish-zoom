import { NavLink } from 'react-router-dom';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  Wrench, 
  AlertTriangle, 
  Calendar, 
  Users, 
  Settings, 
  FileText, 
  Film
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string;
}

const AdminNavigation = () => {
  const { t } = useSafeTranslation();

  const navItems: NavItem[] = [
    { 
      to: '/admin', 
      label: t('analytics'), 
      icon: BarChart2, 
      exact: true
    },
    { 
      to: '/admin/services', 
      label: t('manage_services'), 
      icon: Wrench
    },
    { 
      to: '/admin/incidents', 
      label: t('manage_incidents'), 
      icon: AlertTriangle
    },
    { 
      to: '/admin/maintenance', 
      label: t('manage_maintenance'), 
      icon: Calendar
    },
    { 
      to: '/admin/users', 
      label: t('manage_users'), 
      icon: Users
    },
    { 
      to: '/admin/jellyfin', 
      label: t('jellyfin_tab_title'), 
      icon: Film
    },
    { 
      to: '/admin/settings', 
      label: t('settings'), 
      icon: Settings
    },
    { 
      to: '/admin/logs', 
      label: t('logs'), 
      icon: FileText
    }
  ];

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-full"
    >
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.15, 
                delay: index * 0.03,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <NavLink
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn(
                      "h-4 w-4 transition-colors duration-200",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    <span className={cn(
                      "transition-colors duration-200",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full"
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            
            return (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.2, 
                  delay: index * 0.05,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="flex-shrink-0"
              >
                <NavLink
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    cn(
                      'relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-w-[60px]',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn(
                        "h-4 w-4 transition-colors duration-200",
                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      <span className={cn(
                        "text-center leading-tight transition-colors duration-200",
                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

export default AdminNavigation;
