import { useTranslation } from 'react-i18next';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type OverallStatusProps = {
  status: 'all_systems_operational' | 'partial_outage' | 'major_outage';
  lastUpdatedText: string;
};

const statusConfig = {
  all_systems_operational: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    textKey: 'all_systems_operational',
  },
  partial_outage: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    textKey: 'partial_outage',
  },
  major_outage: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    textKey: 'major_outage',
  },
};

const OverallStatus = ({ status, lastUpdatedText }: OverallStatusProps) => {
  const { t } = useTranslation();
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("p-4 rounded-lg text-center", config.bgColor)}>
      <div className="flex items-center justify-center">
        <Icon className={cn("h-8 w-8 mr-3 shrink-0", config.color)} />
        <h1 className="text-xl md:text-2xl font-bold text-foreground">{t(config.textKey)}</h1>
      
      </div>
      <p className="text-xs text-muted-foreground mt-2">{lastUpdatedText}</p>
    </div>
  );
};

export default OverallStatus;