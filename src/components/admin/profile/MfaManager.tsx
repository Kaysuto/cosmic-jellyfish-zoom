import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Factor } from '@supabase/supabase-js';
import { auditLog } from '@/utils/audit';

const MfaManager = () => {
  const { t } = useTranslation();
  const [mfaFactors, setMfaFactors] = useState<Factor[]>([]);
  const [isLoadingMfa, setIsLoadingMfa] = useState(true);
  const [isMfaDialogVisible, setIsMfaDialogVisible] = useState(false);
  const [isUnenrollDialogVisible, setIsUnenrollDialogVisible] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifiedFactor = mfaFactors.find(f => f.status === 'verified');

  const fetchMfaStatus = useCallback(async () => {
    setIsLoadingMfa(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      showError(t('error_fetching_mfa_status'));
      setMfaFactors([]);
    } else {
      setMfaFactors(data.all);
    }
    setIsLoadingMfa(false);
  }, [t]);

  useEffect(() => {
    fetchMfaStatus();
  }, [fetchMfaStatus]);

  const handleEnableMfa = async () => {
    try {
      const { data: factorsData, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;

      const unverifiedFactor = factorsData.all.find(f => f.status === 'unverified');
      if (unverifiedFactor) {
        await supabase.auth.mfa.unenroll({ factorId: unverifiedFactor.id });
      }

      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      
      setQrCode(data.totp.qr_code);
      setMfaSecret(data.totp.secret);
      setIsMfaDialogVisible(true);
      await fetchMfaStatus();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleVerifyMfa = async () => {
    if (!verifiedFactor) {
      setIsVerifying(true);
      setEnrollError(null);
      const unverifiedFactor = mfaFactors.find(f => f.status === 'unverified');
      if (!unverifiedFactor) {
        setEnrollError("Aucun facteur à vérifier. Veuillez réessayer.");
        setIsVerifying(false);
        return;
      }

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: unverifiedFactor.id });
      if (challengeError) {
        setEnrollError(challengeError.message);
        setIsVerifying(false);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: unverifiedFactor.id,
        challengeId: challenge.id,
        code: verificationCode,
      });

      if (verifyError) {
        setEnrollError(verifyError.message);
      } else {
        showSuccess(t('mfa_enabled_successfully'));
        setIsMfaDialogVisible(false);
        setVerificationCode('');
        await auditLog('mfa_enabled', {});
        fetchMfaStatus();
      }
      setIsVerifying(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!verifiedFactor) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: verifiedFactor.id });
    if (error) {
      showError(error.message);
    } else {
      showSuccess(t('mfa_disabled_successfully'));
      await auditLog('mfa_disabled', {});
      fetchMfaStatus();
    }
    setIsUnenrollDialogVisible(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> {t('mfa_title')}</CardTitle>
          <CardDescription>{t('mfa_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMfa ? <Skeleton className="h-10 w-32" /> : (
            verifiedFactor ? (
              <Button variant="destructive" onClick={() => setIsUnenrollDialogVisible(true)}>{t('disable_mfa')}</Button>
            ) : (
              <Button onClick={handleEnableMfa}>{t('enable_mfa')}</Button>
            )
          )}
        </CardContent>
      </Card>

      <Dialog open={isMfaDialogVisible} onOpenChange={setIsMfaDialogVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('enable_mfa')}</DialogTitle>
            <DialogDescription>{t('scan_qr_code')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrCode && <img src={qrCode} alt="QR Code" className="bg-white p-2 rounded-lg" />}
            <p className="text-sm text-muted-foreground">{t('or_use_secret')}</p>
            <code className="bg-muted p-2 rounded font-mono text-sm">{mfaSecret}</code>
            <Input placeholder={t('verification_code_placeholder')} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} className="text-center tracking-widest" maxLength={6} />
            {enrollError && <p className="text-sm text-destructive">{enrollError}</p>}
          </div>
          <DialogFooter>
            <Button onClick={handleVerifyMfa} disabled={isVerifying || verificationCode.length < 6}>{isVerifying ? t('verifying') : t('verify_and_enable')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isUnenrollDialogVisible} onOpenChange={setIsUnenrollDialogVisible}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_disable_mfa_title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirm_disable_mfa_own_account')}</AlertDialogDescription>
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

export default MfaManager;