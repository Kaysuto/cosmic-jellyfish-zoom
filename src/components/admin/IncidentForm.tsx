import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Incident } from '@/hooks/useIncidents';
import { Service } from '@/hooks/useServices';

const incidentSchema = z.object({
  title: z.string().min(1, { message: 'Le titre est requis' }),
  description: z.string().min(1, { message: 'La description est requise' }),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
  service_id: z.string().nullable(),
});

export type IncidentFormValues = z.infer<typeof incidentSchema>;

interface IncidentFormProps {
  incident?: Incident | null;
  services: Service[];
  onSubmit: (values: IncidentFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const IncidentForm = ({ incident, services, onSubmit, onCancel, isSubmitting }: IncidentFormProps) => {
  const { t } = useTranslation();

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: incident?.title || '',
      description: incident?.description || '',
      status: incident?.status || 'investigating',
      service_id: incident?.service_id || null,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('status')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('status')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="investigating">{t('investigating')}</SelectItem>
                  <SelectItem value="identified">{t('identified')}</SelectItem>
                  <SelectItem value="monitoring">{t('monitoring')}</SelectItem>
                  <SelectItem value="resolved">{t('resolved')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="service_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('service')}</FormLabel>
              <Select onValueChange={(value) => field.onChange(value === 'null' ? null : value)} defaultValue={field.value || 'null'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('service')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">{t('no_service_affected')}</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {t(service.name.toLowerCase().replace(/ /g, '_'))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

export default IncidentForm;