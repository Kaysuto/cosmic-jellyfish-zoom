import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Incident } from '@/types/status';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Edit, RefreshCw } from 'lucide-react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

interface IncidentsTableProps {
  incidents: Incident[];
  loading: boolean;
  onEdit: (incident: Incident) => void;
  onRefresh: () => void;
}

const IncidentsTable = ({ incidents, loading, onEdit, onRefresh }: IncidentsTableProps) => {
  const { t } = useSafeTranslation();

  const statusVariantMap: { [key: string]: "default" | "destructive" | "secondary" | "outline" } = {
    resolved: 'secondary',
    investigating: 'destructive',
    monitoring: 'default',
    identified: 'outline',
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('title')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('service')}</TableHead>
            <TableHead>{t('last_update')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">{t('loading')}...</TableCell>
            </TableRow>
          ) : incidents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">{t('no_incidents')}</TableCell>
            </TableRow>
          ) : (
            incidents.map(incident => (
              <TableRow key={incident.id}>
                <TableCell className="font-medium">{incident.title}</TableCell>
                <TableCell>
                  <Badge variant={statusVariantMap[incident.status] || 'default'}>
                    {t(incident.status)}
                  </Badge>
                </TableCell>
                <TableCell>{incident.service?.name || t('system_wide_incident')}</TableCell>
                <TableCell>{format(new Date(incident.incident_updates[0]?.created_at || incident.created_at), 'd MMM yyyy, HH:mm', { locale: fr })}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(incident)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default IncidentsTable;