import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Incident } from '@/types/status';
import { Service } from '@/types/supabase';
import { useAdmins } from '@/hooks/useAdmins';

const incidentSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().min(1, "La description est requise."),
  title_en: z.string().optional(),
  description_en: z.string().optional(),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
  service_id: z.number().nullable(),
  update_message: z.string().min(1, "Un message de mise à jour est requis."),
  admin_id: z.string().optional(),
});

type IncidentFormValues = z.infer<typeof incidentSchema>;

interface IncidentFormProps {
  incident?: Incident | null;
  services: Service[];
  onSubmit: (data: IncidentFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const IncidentForm = ({ incident, services, onSubmit, onCancel, isSubmitting }: IncidentFormProps) => {
  const { admins, loading: loadingAdmins } = useAdmins();
  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: incident?.title || '',
      description: incident?.description || '',
      title_en: (incident as any)?.title_en || '',
      description_en: (incident as any)?.description_en || '',
      status: incident?.status || 'investigating',
      service_id: incident?.service_id || null,
      update_message: '',
      admin_id: incident?.author_id || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Tabs defaultValue="fr" className="mb-4">
          <TabsList className="mb-2">
            <TabsTrigger value="fr">Français</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
          <TabsContent value="fr">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre (français)</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de l'incident (français)" {...field} />
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
                  <FormLabel>Description (français)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description de l'incident (français)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="en">
            <FormField
              control={form.control}
              name="title_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="Incident title (English)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (English)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Incident description (English)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
        <FormField
          control={form.control}
          name="admin_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Administrateur associé</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={loadingAdmins}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un admin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.first_name || admin.email || admin.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="investigating">En cours d'investigation</SelectItem>
                    <SelectItem value="identified">Identifié</SelectItem>
                    <SelectItem value="monitoring">Surveillance</SelectItem>
                    <SelectItem value="resolved">Résolu</SelectItem>
                    <SelectItem value="null">Aucun (incident général)</SelectItem>
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
                <FormLabel>Service affecté</FormLabel>
                <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">Aucun (incident général)</SelectItem>
                    {services.map(service => (
                      <SelectItem key={service.id} value={String(service.id)}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="update_message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message de mise à jour</FormLabel>
              <FormControl>
                <Textarea placeholder="Décrivez la dernière mise à jour..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default IncidentForm;