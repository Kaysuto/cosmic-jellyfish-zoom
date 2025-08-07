import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger,<dyad-problem-report summary="2 problems">
<problem file="src/pages/admin/Settings.tsx" line="148" column="32" code="2552">Cannot find name 'FormDescription'. Did you mean 'CardDescription'?</problem>
<problem file="src/pages/admin/Settings.tsx" line="148" column="78" code="2552">Cannot find name 'FormDescription'. Did you mean 'CardDescription'?</problem>
</dyad-problem-report><think>**Considering Import Issues**

I'm focusing on resolving the "Cannot find name 'Form Description'" errors in the `Settings.tsx` file. It seems I'm missing the `FormDescription` import, likely from the `shadcn/ui` library's `Form` component. My next step is to verify the exact import statement needed to rectify this.


**Analyzing Import Fixes**

I've identified the root cause: a missing import for `FormDescription` in `Settings.tsx`. It originates from the `Form` component within the `shadcn/ui` library. I'm updating the import statement to include `FormDescription`, and then I'll compile the code to verify that the errors are resolved.


**Implementing the Import**

I've pinpointed the precise import alteration needed in `src/pages/admin/Settings.tsx`. The fix involves adding `FormDescription` to the import statement from the `form` component, which is located within the `shadcn/ui` library. My next action is to implement this change in the code and then test the compilation.


**Correcting and Verifying**

I've now identified the fix and composed the complete corrected `Settings.tsx` file. The adjusted import statement now includes `FormDescription` from the appropriate `shadcn/ui` Form component. Next, I will compile the code to validate the changes and ensure the errors are resolved, then move to testing.


**Finalizing Code Changes**

I've now reviewed the code and made the necessary adjustments, including the critical `FormDescription` import. The updated `Settings.tsx` file is ready, and I'll begin the final step of compiling to confirm the resolution of the original compile-time errors.


**Compiling the Fix**

I've corrected the import statement to include `FormDescription` in the `Settings.tsx` file. Next, I will run the TypeScript compiler to verify the changes and confirm the initial compile-time errors are now resolved.


**Generating Corrected Code**

I've now written the complete `Settings.tsx` file, which incorporates the corrected import statement. The updated import from `@/components/ui/form` now includes `FormDescription`, and all other code has been included. Next, I'll proceed to the compilation phase to verify the fix.


**Creating the Complete File**

I've now constructed the complete `Settings.tsx` file, fully addressing the missing `FormDescription` import. The file includes all previous components and the updated import statement from `@/components/ui/form`, now correctly including `FormDescription`. Next, I'll test by compiling.


**Fixing and Compiling**

I've updated `src/pages/admin/Settings.tsx` to include the necessary `FormDescription` import. I've included the code from the original file, incorporating the correction in the import statement from `@/components/ui/form`. My next step is compilation to confirm the errors have vanished.


**Completing and Validating**

I've reviewed the code and integrated the necessary `FormDescription` import, along with all other included code, into the complete `Settings.tsx` file. The import from `@/components/ui/form` is now correct. Now, I will perform a compilation to make sure all errors are gone.


</think>Bonjour, j'ai identifié et corrigé les erreurs de compilation.

Les deux erreurs provenaient d'un import manquant dans le fichier `Settings.tsx`.

Voici le correctif :

<dyad-write path="src/pages/admin/Settings.tsx" description="Ajout de l'import manquant pour FormDescription.">
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Settings as SettingsIcon } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/contexts/SettingsContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { profile } = useProfile();
  const { getSetting, refreshSettings, loading: settingsLoading } = useSettings();
  
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingSettings, setPendingSettings] = useState<z.infer<typeof generalSettingsSchema> | null>(null);

  const generalSettingsSchema = useMemo(() => z.object({
    site_title: z.string().min(1, { message: t('site_title_empty_error') }),
    default_language: z.enum(['fr', 'en']),
  }), [t]);

  const form = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: { site_title: '', default_language: 'fr' },
  });

  useEffect(() => {
    if (!settingsLoading) {
      const regValue = getSetting('allow_registrations', 'true');
      setAllowRegistrations(regValue === 'true');
      setLoadingRegistrations(false);

      form.reset({
        site_title: getSetting('site_title', 'Statut des Services Jelly'),
        default_language: getSetting('default_language', 'fr') as 'fr' | 'en',
      });
    }
  }, [settingsLoading, getSetting, form]);

  const handleRegistrationToggle = async (checked: boolean) => {
    const originalState = allowRegistrations;
    setAllowRegistrations(checked);
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'allow_registrations', value: checked.toString() }, { onConflict: 'key' });

    if (error) {
      showError(t('error_updating_setting'));
      setAllowRegistrations(originalState);
    } else {
      showSuccess(t(checked ? 'registrations_enabled' : 'registrations_disabled'));
      refreshSettings();
    }
  };

  const handleGeneralSettingsSubmit = (values: z.infer<typeof generalSettingsSchema>) => {
    setPendingSettings(values);
    setIsConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingSettings) return;

    const settingsToUpdate = [
      { key: 'site_title', value: pendingSettings.site_title },
      { key: 'default_language', value: pendingSettings.default_language },
    ];

    const { error } = await supabase.from('app_settings').upsert(settingsToUpdate, { onConflict: 'key' });

    if (error) {
      showError(t('error_updating_setting'));
    } else {
      showSuccess(t('settings_updated_successfully'));
      refreshSettings();
    }
    setIsConfirmOpen(false);
    setPendingSettings(null);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t('settings')}</h1>
            <p className="text-muted-foreground">{t('settings_description')}</p>
          </div>

          {profile?.role === 'admin' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><SettingsIcon className="h-5 w-5" />{t('general_settings')}</CardTitle>
                  <CardDescription>{t('general_settings_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {settingsLoading ? <Skeleton className="h-48 w-full" /> : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleGeneralSettingsSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="site_title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('site_title_label')}</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="default_language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('default_language')}</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="fr">Français</SelectItem>
                                  <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>{t('default_language_desc')}</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={form.formState.isSubmitting}>{t('save_changes')}</Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />{t('registration_settings')}</CardTitle>
                  <CardDescription>{t('allow_new_registrations_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingRegistrations ? (
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-10 rounded-full" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allow-registrations"
                        checked={allowRegistrations}
                        onCheckedChange={handleRegistrationToggle}
                      />
                      <Label htmlFor="allow-registrations">{t('allow_new_registrations')}</Label>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_global_changes_title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirm_global_changes_desc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingSettings(null)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>{t('save_changes')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Settings;