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
import { Profile } from '@/hooks/useProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const incidentSchema = z.object({
  title: z.string().min(1, { message: 'Le titre est requis' }),
  description: z.string().min(1, { message: 'La description est requise' }),
  title_en: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
  service_id: z.string().nullable(),
  author_id: z.string().uuid("L'auteur est requis."),
});

export type IncidentFormValues = z.infer<typeof incidentSchema>;

interface IncidentFormProps {
  incident?: Incident | null;
  services: Service[];
  admins: Profile[];
  currentUserId: string;
  onSubmit: (values: IncidentFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const IncidentForm = ({ incident, services, admins, currentUserId, onSubmit, onCancel, isSubmitting }: IncidentFormProps) => {
  const { t } = useTranslation();

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: incident?.title || '',
      description: incident?.description || '',
      title_en: incident?.title_en || '',
      description_en: incident?.description_en || '',
      status: incident?.status || 'investigating',
      service_id: incident?.service_id || null,
      author_id: incident?.author_id || currentUserId,
    },
  });

  const handleFormSubmit = (values: IncidentFormValues) => {
    const dataToSubmit: any = { ...values };
    if (values.status === 'resolved' && (!incident || incident.status !== 'resolved')) {
      dataToSubmit.resolved_at = new Date().toISOString();
    } else if (values.status !== 'resolved') {
      dataToSubmit.resolved_at = null;
    }
    onSubmit(dataToSubmit);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <Tabs defaultValue="fr" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fr">Français</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
          <TabsContent value="fr" className="space-y-4 pt-4">
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
          </TabsContent>
          <TabsContent value="en" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="title_en"
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
              name="description_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('description')}</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

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
                      {t(service.name.toLowerCase().replace(/ /g, '_').replace(/\./g, '_'))}
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
          name="author_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('assign_to')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_admin')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {admins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {`${admin.first_name || ''} ${admin.last_name || ''}`.trim() || admin.email}
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