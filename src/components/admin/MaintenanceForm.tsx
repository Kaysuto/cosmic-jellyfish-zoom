import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Service } from '@/hooks/useServices';
import { Maintenance } from '@/hooks/useMaintenances';
import { format } from 'date-fns';

const maintenanceSchema = z.object({
  title: z.string().min(1, { message: 'Le titre est requis' }),
  description: z.string().optional(),
  service_id: z.string().nullable(),
  start_time: z.string().min(1, { message: 'La date de début est requise' }),
  end_time: z.string().min(1, { message: 'La date de fin est requise' }),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

interface MaintenanceFormProps {
  maintenance?: Maintenance | null;
  services: Service[];
  onSubmit: (values: MaintenanceFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const MaintenanceForm = ({ maintenance, services, onSubmit, onCancel, isSubmitting }: MaintenanceFormProps) => {
  const { t } = useSafeTranslation();

  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return '';
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
  };

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      title: maintenance?.title || '',
      description: maintenance?.description || '',
      service_id: maintenance?.service_id || null,
      start_time: formatDateForInput(maintenance?.start_time),
      end_time: formatDateForInput(maintenance?.end_time),
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
              <FormControl><Input {...field} /></FormControl>
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
              <FormControl><Textarea {...field} /></FormControl>
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
                  <SelectItem value="null">{t('all_services')}</SelectItem>
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
        <FormField
          control={form.control}
          name="start_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('start_time')}</FormLabel>
              <FormControl><Input type="datetime-local" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="end_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('end_time')}</FormLabel>
              <FormControl><Input type="datetime-local" {...field} /></FormControl>
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

export default MaintenanceForm;