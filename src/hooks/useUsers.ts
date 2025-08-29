import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';
import { showError } from '@/utils/toast';

export const useUsers = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Début de la récupération des utilisateurs...');
      
      // Vérifier la session utilisateur
      const { data: { session } } = await supabase.auth.getSession();
      console.log('👤 Session utilisateur:', session?.user?.id);
      
      // Vérifier le rôle de l'utilisateur
      if (session?.user?.id) {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        console.log('🎭 Rôle utilisateur:', userProfile?.role, 'Erreur:', profileError);
        
        // Vérifier si l'utilisateur a les permissions admin
        if (userProfile?.role !== 'admin') {
          const errorMsg = 'Accès refusé: Seuls les administrateurs peuvent voir tous les utilisateurs';
          console.error('❌', errorMsg);
          setError(errorMsg);
          showError(errorMsg);
          return;
        }
        
        console.log('✅ Permissions admin vérifiées, continuation...');
      } else {
        const errorMsg = 'Session utilisateur non trouvée';
        console.error('❌', errorMsg);
        setError(errorMsg);
        showError(errorMsg);
        return;
      }

      // Utiliser la fonction Edge pour contourner les restrictions RLS
      console.log('🚀 Utilisation de la fonction Edge get-all-users...');
      const { data, error } = await supabase.functions.invoke('get-all-users');

      console.log('📊 Résultat de la fonction Edge:', { 
        dataCount: data?.users?.length || 0, 
        error: error?.message,
        errorCode: error?.code,
        success: data?.success,
        data: data
      });

      if (error) {
        console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
        
        // Gestion spécifique des erreurs
        let errorMessage = 'Erreur lors de la récupération des utilisateurs';
        
        if (error.message?.includes('non-2xx status code')) {
          errorMessage = 'Erreur de configuration de la fonction Edge. Vérifiez les variables d\'environnement.';
        } else if (error.message?.includes('SUPABASE_SERVICE_ROLE_KEY')) {
          errorMessage = 'Configuration manquante: Clé de service Supabase non définie';
        } else {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }

      if (data?.error) {
        console.error('❌ Erreur retournée par la fonction Edge:', data.error);
        console.error('📋 Détails:', data.details);
        
        let errorMessage = data.error;
        if (data.details) {
          errorMessage += ` - ${data.details}`;
        }
        
        throw new Error(errorMessage);
      }
      
      if (!data?.success) {
        console.error('❌ Réponse invalide de la fonction Edge:', data);
        throw new Error('Réponse invalide de la fonction Edge');
      }
      
      console.log('✅ Utilisateurs récupérés avec succès:', data?.users?.length || 0);
      console.log('📋 Données utilisateurs:', data?.users);
      
      const usersData = data?.users || [];
      console.log('🔧 Mise à jour du state avec:', usersData);
      
      setUsers(usersData);
      setError(null);
    } catch (e: any) {
      const errorMessage = `Erreur lors de la récupération des utilisateurs: ${e.message}`;
      console.error('💥 Erreur finale:', errorMessage);
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      console.log('🏁 Fin de fetchUsers, loading = false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered, appel de fetchUsers');
    fetchUsers();
  }, []);

  const activeUsers = useMemo(() => {
    console.log('🔄 activeUsers recalculé:', users);
    return users;
  }, [users]);

  const usersByRole = useMemo(() => {
    console.log('🔄 usersByRole recalculé avec:', users);
    return users.reduce((acc, user) => {
      const role = user.role || 'user';
      if (!acc[role]) {
        acc[role] = [];
      }
      acc[role].push(user);
      return acc;
    }, {} as Record<string, Profile[]>);
  }, [users]);

  console.log('🔄 useUsers return:', { users, loading, error, usersLength: users?.length });

  return { users, loading, error, fetchUsers, refreshUsers: fetchUsers, activeUsers, usersByRole };
};