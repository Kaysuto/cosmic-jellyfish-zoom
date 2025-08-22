import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Wrench, AlertTriangle } from 'lucide-react';

const QuickActions = () => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions Rapides</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button asChild>
          <Link to="/admin/incidents"><AlertTriangle className="mr-2 h-4 w-4" /> {t('create_incident')}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/admin/maintenance"><Wrench className="mr-2 h-4 w-4" /> {t('schedule_maintenance')}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/admin/services"><PlusCircle className="mr-2 h-4 w-4" /> {t('create_service')}</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;