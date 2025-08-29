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

  // Debug logs
  console.log('🔍 UserManager - Données reçues:', {
    sessionUserId: session?.user?.id,
    totalUsers: users?.length || 0,
    users: users,
    loading
  });

  // Temporairement désactiver le filtre pour voir l'utilisateur connecté
  const filteredUsers = users; // users.filter(u => u.id !== session?.user.id);
  
  console.log('🔍 UserManager - Utilisateurs filtrés:', {
    filteredCount: filteredUsers.length,
    filteredUsers: filteredUsers,
    excludedUserId: session?.user?.id,
    note: 'Filtre temporairement désactivé pour test'
  });

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
        const updateAttributes: any = {
          user_metadata: {
            first_name: data.first_name,
            last_name: data.last_name,
          },
          raw_user_meta_data: {
            role: data.role,
            first_name: data.first_name,
            last_name: data.last_name,
          }
        };

        // Ajouter le mot de passe seulement s'il est fourni
        if (data.password && data.password.trim() !== '') {
          updateAttributes.password = data.password;
        }

        // Mettre à jour les informations de base de l'utilisateur
        const { error: updateError } = await supabase.functions.invoke('update-user-details', {
          body: {
            userId: selectedUser.id,
            attributes: updateAttributes
          }
        });
        
        if (updateError) throw updateError;

        // Gérer le changement de MFA si nécessaire
        if (data.has_mfa !== selectedUser.has_mfa) {
          const { error: mfaError } = await supabase.functions.invoke('toggle-user-mfa', {
            body: {
              userId: selectedUser.id,
              enable: data.has_mfa
            }
          });
          
          if (mfaError) {
            // Si l'erreur est liée à l'activation du MFA (utilisateur n'a pas configuré), on continue
            if (data.has_mfa && mfaError.message?.includes('configuré')) {
              showError('MFA non activé: L\'utilisateur doit d\'abord configurer son MFA depuis son profil.');
            } else {
              throw mfaError;
            }
          }
        }
        
        const successMessage = data.password && data.password.trim() !== '' 
          ? 'Utilisateur et mot de passe mis à jour avec succès.'
          : 'Utilisateur mis à jour avec succès.';
        showSuccess(successMessage);
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
          users={filteredUsers}
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