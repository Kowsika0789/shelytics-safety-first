import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RiskLevel } from '@/types/database';
import { toast } from 'sonner';

export interface ZoneSuggestion {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  radius_meters: number;
  suggested_risk_level: RiskLevel;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateZoneSuggestionInput {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius_meters?: number;
  suggested_risk_level?: RiskLevel;
}

export const useZoneSuggestions = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<ZoneSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = useCallback(async () => {
    if (!user) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('zone_suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching zone suggestions:', error);
      toast.error('Failed to load your zone suggestions');
    } else {
      setSuggestions((data as ZoneSuggestion[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const createSuggestion = async (input: CreateZoneSuggestionInput): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to suggest a zone');
      return false;
    }

    const { error } = await supabase.from('zone_suggestions').insert({
      user_id: user.id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      latitude: input.latitude,
      longitude: input.longitude,
      radius_meters: input.radius_meters || 200,
      suggested_risk_level: input.suggested_risk_level || 'at_risk',
    });

    if (error) {
      console.error('Error creating zone suggestion:', error);
      toast.error('Failed to submit zone suggestion');
      return false;
    }

    toast.success('Zone suggestion submitted for review');
    await fetchSuggestions();
    return true;
  };

  const updateSuggestion = async (
    id: string,
    updates: Partial<CreateZoneSuggestionInput>
  ): Promise<boolean> => {
    const { error } = await supabase
      .from('zone_suggestions')
      .update({
        name: updates.name?.trim(),
        description: updates.description?.trim(),
        latitude: updates.latitude,
        longitude: updates.longitude,
        radius_meters: updates.radius_meters,
        suggested_risk_level: updates.suggested_risk_level,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating zone suggestion:', error);
      toast.error('Failed to update zone suggestion');
      return false;
    }

    toast.success('Zone suggestion updated');
    await fetchSuggestions();
    return true;
  };

  const deleteSuggestion = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('zone_suggestions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting zone suggestion:', error);
      toast.error('Failed to delete zone suggestion');
      return false;
    }

    toast.success('Zone suggestion deleted');
    await fetchSuggestions();
    return true;
  };

  return {
    suggestions,
    loading,
    createSuggestion,
    updateSuggestion,
    deleteSuggestion,
    refetch: fetchSuggestions,
  };
};
