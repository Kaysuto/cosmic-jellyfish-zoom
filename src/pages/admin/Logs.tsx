import { useState } from 'react';
import { useAuditLogs, AuditLog } from '@/hooks/useAuditLogs';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getGravatarURL } from '@/lib/gravatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const getActionDescription = (log: AuditLog, t: TFunction): string => {
  const { action, details } = log;
  const options = { ...details };

  switch (action) {
    case 'user_login_success': return String(t('log_desc_user_login_success', options));
    case 'user_login_failed': return String(t('log_desc_user_login_failed', options));
    case 'user_logout': return String(t('log_desc_user_logout', options));
    case 'incident_updated': return String(t('log_desc_incident_updated', options));
    case 'incident_created': return String(t('log_desc_incident_created', options));
    case 'incident_deleted': return String(t('log_desc_incident_deleted', options));
    case 'service_updated': return String(t('log_desc_service_updated', options));
    case 'service_created': return String(t('log_desc_service_created', options));
    case 'service_deleted': return String(t('log_desc_service_deleted', options));
    case 'maintenance_updated': return String(t('log_desc_maintenance_updated', options));
    case 'maintenance_created': return String(t('log_desc_maintenance_created', options));
    case 'maintenance_deleted': return String(t('log_desc_maintenance_deleted', options));
    case 'user_deleted': return String(t('log_desc_user_deleted', options));
    case 'user_role_changed': return String(t('log_desc_user_role_changed', options));
    case 'admin_mfa_disabled': return String(t('log_desc_admin_mfa_disabled', options));
    case 'user_created_by_admin': return String(t('log_desc_user_created_by_admin', options));
    case 'setting_updated': return String(t('log_desc_setting_updated', options));
    case 'admin_user_details_updated': return String(t('log_desc_admin_user_details_updated', options));
    case 'user_profile_updated': return String(t('log_desc_user_profile_updated', options));
    case 'admin_profile_updated': return String(t('log_desc_admin_profile_updated', options));
    case 'user_email_change_request': return String(t('log_desc_user_email_change_request', options));
    case 'user_password_updated': return String(t('log_desc_user_password_updated', options));
    case 'user_mfa_enabled': return String(t('log_desc_user_mfa_enabled', options));
    case 'user_mfa_disabled': return String(t('log_desc_user_mfa_disabled', options));
    default: return String(t('log_desc_unknown_action'));
  }
};

const LogsPage = () => {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { logs, loading, error, totalCount } = useAuditLogs(currentPage, itemsPerPage);
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const renderContent = () => {
    if (loading) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead><Skeleton className="h-5 w-32" /></TableHead>
              <TableHead><Skeleton className="h-5 w-48" /></TableHead>
              <TableHead><Skeleton className="h-5 w-20" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(itemsPerPage)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (logs.length === 0) {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{t('no_logs_found_title')}</AlertTitle>
          <AlertDescription>{t('no_logs_found_desc')}</AlertDescription>
        </Alert>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">{t('date')}</TableHead>
            <TableHead className="w-[250px]">{t('user')}</TableHead>
            <TableHead>{t('description')}</TableHead>
            <TableHead className="w-[50px] text-right">{t('details')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map(log => (
            <TableRow key={log.id}>
              <TableCell className="text-xs whitespace-nowrap">
                <div className="font-medium">{format(new Date(log.created_at), 'd MMM yyyy, HH:mm:ss', { locale: currentLocale })}</div>
                <div className="text-muted-foreground">{formatDistanceToNow(new Date(log.created_at), { locale: currentLocale, addSuffix: true })}</div>
              </TableCell>
              <TableCell>
                {log.profiles ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getGravatarURL(log.profiles.email)} />
                      <AvatarFallback>{log.profiles.first_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{log.profiles.first_name} {log.profiles.last_name}</div>
                      <div className="text-xs text-muted-foreground">{log.profiles.email}</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">{t('system')}</span>
                )}
              </TableCell>
              <TableCell>
                <p className="text-sm">{getActionDescription(log, t)}</p>
                <Badge variant="outline" className="mt-1">{log.action}</Badge>
              </TableCell>
              <TableCell className="text-right">
                {log.details && Object.keys(log.details).length > 0 && (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-none">
                      <AccordionTrigger className="p-2 hover:no-underline">&nbsp;</AccordionTrigger>
                      <AccordionContent>
                        <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto max-w-md ml-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('audit_logs')}</CardTitle>
          <CardDescription>{t('audit_logs_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
        {totalCount > 0 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              {t('pagination_total', { total: totalCount })}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">{t('items_per_page')}</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 15, 20, 50, 100].map(size => (
                      <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {t('page_x_of_y', { x: currentPage, y: totalPages })}
                </span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default LogsPage;