import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';

interface AdminFormProps {
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  onBack?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  backLabel?: string;
  loading?: boolean;
  variant?: 'create' | 'edit' | 'default';
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: ReactNode;
}

const AdminForm = ({
  title,
  description,
  children,
  onSubmit,
  onCancel,
  onBack,
  submitLabel = 'Enregistrer',
  cancelLabel = 'Annuler',
  backLabel = 'Retour',
  loading = false,
  variant = 'default',
  className,
  icon: Icon,
  actions
}: AdminFormProps) => {
  const variantConfig = {
    create: {
      icon: Plus,
      iconColor: 'text-green-500',
      bgColor: 'from-green-500/10 to-emerald-500/5',
      borderColor: 'border-green-500/20'
    },
    edit: {
      icon: Save,
      iconColor: 'text-blue-500',
      bgColor: 'from-blue-500/10 to-cyan-500/5',
      borderColor: 'border-blue-500/20'
    },
    default: {
      icon: Save,
      iconColor: 'text-primary',
      bgColor: 'from-primary/10 to-secondary/5',
      borderColor: 'border-primary/20'
    }
  };

  const config = variantConfig[variant];
  const FormIcon = Icon || config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("space-y-6", className)}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2 hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-xl bg-gradient-to-br",
              config.bgColor,
              config.borderColor
            )}>
              <FormIcon className={cn("h-6 w-6", config.iconColor)} />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {title}
              </h1>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
        </div>
        {actions}
      </motion.div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm">
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-50",
            config.bgColor
          )} />
          
          <CardContent className="relative p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="space-y-6"
            >
              {children}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      {(onSubmit || onCancel) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex items-center justify-end gap-3 pt-4 border-t border-border/50"
        >
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              {cancelLabel}
            </Button>
          )}
          {onSubmit && (
            <Button
              onClick={onSubmit}
              disabled={loading}
              className={cn(
                "flex items-center gap-2",
                variant === 'create' && "bg-green-600 hover:bg-green-700",
                variant === 'edit' && "bg-blue-600 hover:bg-blue-700"
              )}
            >
              <Save className="h-4 w-4" />
              {loading ? 'Enregistrement...' : submitLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminForm;
