import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = "default",
  className 
}: StatCardProps) => {
  const variantStyles = {
    default: {
      card: "bg-gradient-to-br from-background to-muted/50 border-border/50",
      icon: "text-primary",
      value: "text-foreground",
      title: "text-muted-foreground"
    },
    success: {
      card: "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20",
      icon: "text-green-500",
      value: "text-green-600 dark:text-green-400",
      title: "text-green-700/70 dark:text-green-300/70"
    },
    warning: {
      card: "bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border-yellow-500/20",
      icon: "text-yellow-500",
      value: "text-yellow-600 dark:text-yellow-400",
      title: "text-yellow-700/70 dark:text-yellow-300/70"
    },
    danger: {
      card: "bg-gradient-to-br from-red-500/10 to-pink-500/5 border-red-500/20",
      icon: "text-red-500",
      value: "text-red-600 dark:text-red-400",
      title: "text-red-700/70 dark:text-red-300/70"
    },
    info: {
      card: "bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20",
      icon: "text-blue-500",
      value: "text-blue-600 dark:text-blue-400",
      title: "text-blue-700/70 dark:text-blue-300/70"
    }
  };

  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.25, 
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: Math.random() * 0.1
      }}
      whileHover={{ 
        y: -2, 
        scale: 1.01,
        transition: { duration: 0.15, ease: "easeOut" }
      }}
    >
      <Card className={cn(
        "relative overflow-hidden border-0 shadow-lg backdrop-blur-sm transition-all duration-150",
        styles.card,
        className
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-150" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className={cn("text-sm font-medium transition-colors", styles.title)}>
            {title}
          </CardTitle>
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative"
          >
            <Icon className={cn("h-5 w-5 transition-all duration-150", styles.icon)} />
            <div className="absolute inset-0 bg-current rounded-full blur-sm opacity-20" />
          </motion.div>
        </CardHeader>
        
        <CardContent className="space-y-2">
          <motion.div 
            className={cn("text-3xl font-bold tracking-tight", styles.value)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {value}
          </motion.div>
          
          {trend && (
            <motion.div 
              className="flex items-center gap-1 text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <span className={cn(
                "flex items-center gap-1",
                trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {trend.isPositive ? "↗" : "↘"}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground">vs mois dernier</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;