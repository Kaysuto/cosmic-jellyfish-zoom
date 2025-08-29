import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Incident } from '@/types/status';
import { useAdmins } from '@/hooks/useAdmins';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Edit, RefreshCw } from 'lucide-react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getGravatarURL } from '@/lib/gravatar';

interface IncidentsTableProps {
  incidents: Incident[];
  loading: boolean;
  onEdit: (incident: Incident) => void;
  onRefresh: () => void;
}

const IncidentsTable = ({ incidents, loading, onEdit, onRefresh }: IncidentsTableProps) => {
  const { t } = useSafeTranslation();
  const { admins } = useAdmins();

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
            <TableHead>Admin</TableHead>
            <TableHead>{t('last_update')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">{t('loading')}...</TableCell>
            </TableRow>
          ) : incidents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">{t('no_incidents')}</TableCell>
            </TableRow>
          ) : (
            incidents.map(incident => {
              const admin = admins.find(a => a.id === incident.author_id);
              return (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">{incident.title}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[incident.status] || 'default'}>
                      {t(incident.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{incident.service?.name || t('system_wide_incident')}</TableCell>
                  <TableCell>
                    {admin ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={admin.avatar_url || getGravatarURL(admin.email)} alt={admin.first_name || admin.email || admin.id} />
                          <AvatarFallback>{(admin.first_name?.[0] || admin.email?.[0] || admin.id[0] || '?').toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{admin.first_name || admin.email || admin.id}</span>
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{format(new Date(incident.incident_updates[0]?.created_at || incident.created_at), 'd MMM yyyy, HH:mm', { locale: fr })}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(incident)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default IncidentsTable;