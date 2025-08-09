import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Service } from '@/hooks/useServices';

const serviceSchema = z.object({
  name: z.string().min(1, { message: 'Le nom est requis' }),
  description: z.string().optional(),
  url: z.string().url({ message: "L'URL n'est pas valide" }).optional().or(z.literal('')),
  ip_address: z.string().optional().nullable(),
  port: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: "Le port doit être un nombre." })
      .positive({ message: "Le port doit être un nombre positif." })
      .int()
      .min(1, "Le port doit être supérieur à 0.")
      .max(65535, "Le port doit être inférieur à 65536.")
      .optional()
  ),
}).refine(data => !!data.ip_address === !!data.port, {
    message: "L'adresse IP et le port doivent être fournis ensemble, ou aucun des deux.",
    path: ["port"],
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  service?: Service | null;
  onSubmit: (values: ServiceFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ServiceForm = ({ service, onSubmit, onCancel, isSubmitting }: ServiceFormProps) => {
  const { t } = useTranslation();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      url: service?.url || '',
      ip_address: service?.ip_address || null,
      port: service?.port || undefined,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('title')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('description')}</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de surveillance</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com" />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Laissez vide si le service n'a pas d'URL à surveiller. Le statut sera défini sur "En maintenance".
              </p>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ip_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse IP (Optionnel)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="123.45.67.89" />
              </FormControl>
              <FormDescription>
                IP du serveur d'origine pour contourner Cloudflare pour les vérifications.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="port"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Port (Optionnel)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} onChange={field.onChange} placeholder="443" />
              </FormControl>
              <FormDescription>
                Port du serveur d'origine. Doit être utilisé avec l'adresse IP.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('saving') : t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ServiceForm;