import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useMemo, useEffect } from 'react';

const emailRegex = new RegExp(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

interface ForgotPasswordFormProps {
  onSubmit: (values: z.infer<typeof forgotPasswordSchema>) => void;
  isLoading: boolean;
}

const forgotPasswordSchema = z.object({
  email: z.string().regex(emailRegex, { message: 'Adresse e-mail invalide' }),
});

const ForgotPasswordForm = ({ onSubmit, isLoading }: ForgotPasswordFormProps) => {
  const { t, i18n } = useTranslation();

  const dynamicForgotPasswordSchema = useMemo(() => z.object({
    email: z.string().regex(emailRegex, { message: t('invalid_email') }),
  }), [t]);

  const form = useForm<z.infer<typeof dynamicForgotPasswordSchema>>({
    resolver: zodResolver(dynamicForgotPasswordSchema),
    defaultValues: { email: '' },
  });



  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) form.trigger();
  }, [i18n.language, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>{t('email_address')}</FormLabel><FormControl><Input type="email" placeholder={t('email_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? t('saving') : t('send_recovery_link')}
        </Button>
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;