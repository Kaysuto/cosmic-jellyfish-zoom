import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Profile } from '@/hooks/useProfile';

interface AdminMfaManagerProps {
  user: Profile;
}

const AdminMfaManager = ({ user }: AdminMfaManagerProps) => {
  const { t } = useTranslation();
  const [hasMfa, setHasMfa] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnenrollDialogOpen, setIsUnenrollDialogOpen] = useState(false);

  const fetchMfaStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-user-mfa-factors', {
        body: { userId: user.id },
      });
      if (error) throw error;
      if (data && data.factors) {
        const verifiedFactor = data.factors.find((f: any) => f.status === 'verified');
        setHasMfa(!!verifiedFactor);
      } else {
        setHasMfa(false);
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchMfaStatus();
  }, [fetchMfaStatus]);

  const handleDisableMfa = async () => {
    try {
      const { error } = await supabase.functions.invoke('admin-unenroll-mfa', { body: { userId: user.id } });
      if (error) throw error;
      showSuccess(t('mfa_disabled_for_user', { email: user.email }));
      fetchMfaStatus();
    } catch (error: any) {
      showError(`${t('error_disabling_mfa')}: ${error.message}`);
    } finally {
      setIsUnenrollDialogOpen(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> {t('mfa_title')}</CardTitle>
          <CardDescription>{t('manage_user_mfa_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-10 w-32" /> : (
            hasMfa ? (
              <Button variant="destructive" onClick={() => setIsUnenrollDialogOpen(true)}>
                <ShieldOff className="mr-2 h-4 w-4" />
                {t('disable_mfa')}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">{t('user_mfa_disabled')}</p>
            )
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isUnenrollDialogOpen} onOpenChange={setIsUnenrollDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_disable_mfa_title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirm_disable_mfa_desc', { email: user.email })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisableMfa} className={buttonVariants({ variant: "destructive" })}>{t('disable_mfa')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminMfaManager;