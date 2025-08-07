import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Edit, Loader2, Trash2 } from 'lucide-react';
import { getGravatarURL } from '@/lib/gravatar';
import { Profile } from '@/hooks/useProfile';
import { Session } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { auditLog } from '@/utils/audit';

interface UserProfileCardProps {
  profile: Profile;
  session: Session | null;
  onProfileUpdate: () => void;
}

const UserProfileCard = ({ profile, session, onProfileUpdate }: UserProfileCardProps) => {
  const { t, i18n } = useTranslation();
  const currentLocale = i18n.language === 'fr' ? fr : enUS;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isOwnProfile = session?.user?.id === profile.id;

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isOwnProfile) return;

    setIsUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${profile.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      showError(uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', profile.id);

    if (dbError) {
      showError(dbError.message);
    } else {
      showSuccess('Avatar mis à jour avec succès !');
      // Audit log
      await auditLog('avatar_updated', { profileId: profile.id, avatar_url: publicUrl });
      onProfileUpdate();
    }
    setIsUploading(false);
  };

  const handleDeleteAvatar = async () => {
    if (!profile.avatar_url || !isOwnProfile) return;

    setIsDeleting(true);
    try {
      const url = new URL(profile.avatar_url);
      const filePath = url.pathname.split('/avatars/')[1];

      // Supprimer le fichier du stockage
      const { error: storageError } = await supabase.storage.from('avatars').remove([filePath]);
      if (storageError) throw storageError;

      // Mettre à jour la base de données
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('id', profile.id);
      if (dbError) throw dbError;

      showSuccess("Avatar supprimé avec succès.");
      // Audit log
      await auditLog('avatar_deleted', { profileId: profile.id });
      onProfileUpdate();
    } catch (error: any) {
      showError(`Erreur lors de la suppression de l'avatar: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 p-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-4 border-background">
                <AvatarImage src={profile.avatar_url || getGravatarURL(profile.email, 160)} />
                <AvatarFallback className="text-3xl">
                  {profile.first_name?.charAt(0)}
                  {profile.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploading || isDeleting}
                    className="p-2 text-white hover:text-blue-400 disabled:opacity-50"
                    title="Modifier l'avatar"
                  >
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Edit className="h-5 w-5" />}
                  </button>
                  {profile.avatar_url && (
                    <button
                      onClick={() => setIsDeleteDialogOpen(true)}
                      disabled={isUploading || isDeleting}
                      className="p-2 text-white hover:text-red-400 disabled:opacity-50"
                      title="Supprimer l'avatar"
                    >
                      {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                    </button>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
                disabled={isUploading || !isOwnProfile}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-1">{t('role')}</h3>
            <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
              {profile.role === 'admin' ? t('admin_role') : t('user_role')}
            </Badge>
          </div>
          {session?.user?.created_at && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground mb-1">{t('member_since')}</h3>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(session.user.created_at), 'd MMMM yyyy', { locale: currentLocale })}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'avatar ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Votre avatar sera supprimé et remplacé par l'image par défaut de Gravatar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAvatar}
              disabled={isDeleting}
              className={buttonVariants({ variant: "destructive" })}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserProfileCard;