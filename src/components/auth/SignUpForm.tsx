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

interface SignUpFormProps {
  onSubmit: (values: z.infer<typeof signupSchema>) => void;
  isLoading: boolean;
}

const signupSchema = z.object({
  email: z.string().regex(emailRegex, { message: 'Adresse e-mail invalide' }),
  password: z.string()
    .min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères.' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, { message: 'Doit contenir une majuscule, une minuscule et un chiffre.' }),
  first_name: z.string().min(1, { message: 'Le prénom est requis.' }),
  last_name: z.string().min(1, { message: 'Le nom de famille est requis.' }),
});

const SignUpForm = ({ onSubmit, isLoading }: SignUpFormProps) => {
  const { t, i18n } = useTranslation();

  const dynamicSignupSchema = useMemo(() => z.object({
    email: z.string().regex(emailRegex, { message: t('invalid_email') }),
    password: z.string()
      .min(6, { message: t('password_too_short') })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, { message: t('password_requirements') }),
    first_name: z.string().min(1, { message: t('first_name_required') }),
    last_name: z.string().min(1, { message: t('last_name_required') }),
  }), [t]);

  const form = useForm<z.infer<typeof dynamicSignupSchema>>({
    resolver: zodResolver(dynamicSignupSchema),
    defaultValues: { email: '', password: '', first_name: '', last_name: '' },
  });



  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) form.trigger();
  }, [i18n.language, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>{t('first_name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>{t('last_name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>{t('email_address')}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>{t('password')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? t('saving') : t('sign_up')}
        </Button>
      </form>
    </Form>
  );
};

export default SignUpForm;