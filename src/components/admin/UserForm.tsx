import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Profile } from '@/types/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getInitials } from '@/lib/utils';
import { getGravatarURL } from '@/lib/gravatar';
import { Shield, ShieldOff, Mail, Calendar, Key, Link, Link2Off, Monitor, Lock } from 'lucide-react';
import { useSafeTranslation } from '@/hooks/useSafeTranslation';

interface UserFormProps {
  user?: Profile | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const UserForm = ({ user, onSubmit, onCancel, isSubmitting }: UserFormProps) => {
  const { t } = useSafeTranslation();
  
  const formSchema = z.object({
    email: z.string().email().optional().or(z.literal('')),
    password: z.string().optional(),
    first_name: z.string().min(1, t('first_name_required')),
    last_name: z.string().min(1, t('last_name_required')),
    role: z.enum(['user', 'admin']),
    has_mfa: z.boolean().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || '',
      password: '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      role: (user?.role as 'user' | 'admin') || 'user',
      has_mfa: user?.has_mfa || false,
    },
  });

  const isEditing = !!user;
  const isJellyfinMapped = !!(user?.jellyfin_user_id || user?.jellyfin_username);

  return (
    <div className="space-y-4">
      {/* En-tête compact avec informations utilisateur */}
      {isEditing && (
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={getGravatarURL(user.email, 48)} />
                <AvatarFallback>
                  {getInitials(`${user.first_name || ''} ${user.last_name || ''}`)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold truncate">
                    {user.first_name} {user.last_name}
                  </h3>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {user.has_mfa ? (
                      <>
                        <Shield className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">MFA</span>
                      </>
                    ) : (
                      <>
                        <ShieldOff className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-500">No MFA</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Informations Jellyfin compactes */}
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Jellyfin</span>
                </div>
                {isJellyfinMapped ? (
                  <div className="flex items-center space-x-2">
                    <Link className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">
                      {user.jellyfin_username || 'Mappé'}
                    </span>
                    {user.is_administrator && (
                      <Badge variant="outline" className="text-xs">Admin JF</Badge>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link2Off className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Non mappé</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulaire compact */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!isEditing && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          
          {isEditing && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (lecture seule)</FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-muted" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Laisser vide pour ne pas changer"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Laissez vide pour conserver le mot de passe actuel
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="user">Utilisateur</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isEditing && (
              <FormField
                control={form.control}
                name="has_mfa"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Authentification à deux facteurs</FormLabel>
                      <FormDescription>
                        {field.value ? 'MFA activé pour cet utilisateur' : 'MFA désactivé pour cet utilisateur'}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Créer')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UserForm;