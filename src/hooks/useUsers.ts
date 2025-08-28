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
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        throw new Error(error.message);
      }
      setUsers(data || []);
      setError(null);
    } catch (e: any) {
      const errorMessage = `Erreur lors de la récupération des utilisateurs: ${e.message}`;
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const activeUsers = useMemo(() => users, [users]);

  const usersByRole = useMemo(() => {
    return users.reduce((acc, user) => {
      const role = user.role || 'user';
      if (!acc[role]) {
        acc[role] = [];
      }
      acc[role].push(user);
      return acc;
    }, {} as Record<string, Profile[]>);
  }, [users]);

  return { users, loading, error, fetchUsers, refreshUsers: fetchUsers, activeUsers, usersByRole };
};