import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmergencyContact } from '@/types/database';

export const useEmergencyContacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false });

    if (!error && data) {
      setContacts(data as EmergencyContact[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = async (contact: Omit<EmergencyContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('emergency_contacts')
      .insert({
        ...contact,
        user_id: user.id
      });

    if (!error) {
      await fetchContacts();
    }

    return { error };
  };

  const updateContact = async (id: string, updates: Partial<EmergencyContact>) => {
    const { error } = await supabase
      .from('emergency_contacts')
      .update(updates)
      .eq('id', id);

    if (!error) {
      await fetchContacts();
    }

    return { error };
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchContacts();
    }

    return { error };
  };

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    refreshContacts: fetchContacts
  };
};
