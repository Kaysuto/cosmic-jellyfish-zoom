import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getGravatarURL } from '@/lib/gravatar';

const LogsPage = () => {
  const { t, i18n } = useTranslation();
  const { logs, loading, error } = useAuditLogs();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;

  const renderContent = () => {
    if (loading) {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-5 w-24" /></TableHead>
              <TableHead><Skeleton className="h-5 w-32" /></TableHead>
              <TableHead><Skeleton className="h-5 w-20" /></TableHead>
              <TableHead><Skeleton className="h-5 w-48" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
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
            <TableHead>{t('action')}</TableHead>
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
              <TableCell><Badge variant="secondary">{log.action}</Badge></TableCell>
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
      </Card>
    </motion.div>
  );
};

export default LogsPage;