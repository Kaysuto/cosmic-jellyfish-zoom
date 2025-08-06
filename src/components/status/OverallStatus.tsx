import { useTranslation } from 'react-i18next';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type OverallStatusProps = {
  status: 'all_systems_operational' | 'partial_outage' | 'major_outage';
  lastUpdated: string;
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

const OverallStatus = ({ status, lastUpdated }: OverallStatusProps) => {
  const { t } = useTranslation();
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("p-6 rounded-lg", config.bgColor)}>
      <div className="flex items-center">
        <Icon className={cn("h-10 w-10 mr-4 shrink-0", config.color)} />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t(config.textKey)}</h1>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-4 text-right">{lastUpdated}</p>
    </div>
  );
};

export default OverallStatus;