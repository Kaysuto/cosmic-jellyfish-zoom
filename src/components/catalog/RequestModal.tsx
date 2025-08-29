import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/AuthContext';
import { showSuccess, showError } from '@/utils/toast';
import type { MediaItem } from './MediaGrid';

interface RequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MediaItem | null;
  onSuccess?: () => void;
}

const RequestModal: React.FC<RequestModalProps> = ({ open, onOpenChange, item, onSuccess }) => {
  const { session } = useSession();
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && item) {
      setNotes('');
    }
  }, [open, item]);

  const handleSubmit = async () => {
    if (!session?.user) {
      showError('Vous devez être connecté pour faire une demande.');
      return;
    }
    if (!item) return;

    // Vérifier si une demande existe déjà pour ce média
    const { data: existingRequest, error: checkError } = await supabase
      .from('media_requests')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('tmdb_id', item.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing request:', checkError);
      showError('Erreur lors de la vérification des demandes existantes.');
      return;
    }

    if (existingRequest) {
      showError('Vous avez déjà fait une demande pour ce média.');
      onOpenChange(false);
      // Mettre à jour l'état même si la demande existe déjà
      onSuccess?.();
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('media_requests').insert({
        user_id: session.user.id,
        media_type: item.media_type,
        tmdb_id: item.id,
        title: item.title || item.name || '',
        poster_path: item.poster_path || null,
        overview: notes || null,
      });

      if (error) throw error;
      showSuccess('Demande envoyée !');
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      showError(err.message || 'Erreur lors de la demande.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {item?.isRequested ? 'Déjà demandé' : `Demander : ${item?.title || item?.name}`}
          </DialogTitle>
          <DialogDescription>
            {item?.isRequested 
              ? 'Vous avez déjà fait une demande pour ce média.'
              : 'Vous pouvez ajouter une note ou un commentaire à la demande (optionnel).'
            }
          </DialogDescription>
        </DialogHeader>

        {!item?.isRequested && (
          <>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Titre</label>
                <Input value={item?.title || item?.name || ''} readOnly />
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-1">Notes (optionnel)</label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>Annuler</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Envoi...' : 'Envoyer la demande'}
              </Button>
            </DialogFooter>
          </>
        )}

        {item?.isRequested && (
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Fermer</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RequestModal;