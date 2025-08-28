import { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import UserForm from './UserForm';
import UsersTable from './UsersTable';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Profile } from '@/types/supabase';
import { useSession } from '@/contexts/AuthContext';
import { useJellyfin } from '@/contexts/JellyfinContext';

const UserManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { session } = useSession();
  const { users, loading, refreshUsers } = useUsers();
  const { syncUserToJellyfin, connectionStatus } = useJellyfin();

  const handleOpenDialog = (user: Profile | null = null) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (selectedUser) {
        // Update logic
        const { error } = await supabase.functions.invoke('update-user', {
          body: {
            userId: selectedUser.id,
            firstName: data.first_name,
            lastName: data.last_name,
            role: data.role,
          }
        });
        if (error) throw error;
        showSuccess('Utilisateur mis à jour avec succès.');
      } else {
        // Create logic
        const { error } = await supabase.functions.invoke('create-user', {
          body: {
            email: data.email,
            password: data.password,
            firstName: data.first_name,
            lastName: data.last_name,
            role: data.role,
          }
        });
        if (error) throw error;
        showSuccess('Utilisateur créé avec succès.');
      }
      refreshUsers();
      handleCloseDialog();
    } catch (error: any) {
      showError(`Erreur: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gérer les utilisateurs</CardTitle>
            <CardDescription>Ajouter, modifier et gérer les utilisateurs.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter un utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{selectedUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</DialogTitle>
              </DialogHeader>
              <UserForm
                user={selectedUser}
                onSubmit={handleSubmit}
                onCancel={handleCloseDialog}
                isSubmitting={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <UsersTable
          users={users.filter(u => u.id !== session?.user.id)}
          loading={loading}
          onEdit={handleOpenDialog}
          onRefresh={refreshUsers}
          onSync={syncUserToJellyfin}
          jellyfinStatus={connectionStatus}
        />
      </CardContent>
    </Card>
  );
};

export default UserManager;