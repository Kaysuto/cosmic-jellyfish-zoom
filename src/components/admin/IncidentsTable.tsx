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
    <div className="p-4 md:p-6">
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="transition-all">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-sm bg-card border border-border/40">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-muted/60">
            <TableRow>
              <TableHead className="font-semibold text-muted-foreground">{t('status')}</TableHead>
              <TableHead className="font-semibold text-muted-foreground">{t('title')}</TableHead>
              <TableHead className="font-semibold text-muted-foreground">{t('service')}</TableHead>
              <TableHead className="font-semibold text-muted-foreground">Admin</TableHead>
              <TableHead className="font-semibold text-muted-foreground">{t('last_update')}</TableHead>
              <TableHead className="text-right font-semibold text-muted-foreground">{t('actions')}</TableHead>
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
                  <TableRow key={incident.id} className="transition-all hover:bg-muted/30">
                    <TableCell>
                      <Badge variant={statusVariantMap[incident.status] || 'default'} className="px-2 py-1 text-xs font-semibold rounded-lg border-border/40">
                        {t(incident.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-foreground max-w-[220px] truncate">{incident.title}</TableCell>
                    <TableCell className="text-muted-foreground">{incident.service?.name || t('system_wide_incident')}</TableCell>
                    <TableCell>
                      {admin ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={admin.avatar_url || getGravatarURL(admin.email)} alt={admin.first_name || admin.email || admin.id} />
                            <AvatarFallback>{(admin.first_name?.[0] || admin.email?.[0] || admin.id[0] || '?').toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">{admin.first_name || admin.email || admin.id}</span>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(incident.incident_updates[0]?.created_at || incident.created_at), 'd MMM yyyy, HH:mm', { locale: fr })}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(incident)} className="hover:bg-primary/10">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default IncidentsTable;