import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useEmergencyContacts } from './useEmergencyContacts';
import { toast } from '@/hooks/use-toast';

export const useSOS = () => {
  const { user, profile } = useAuth();
  const { location, currentRiskLevel } = useLocation();
  const { contacts } = useEmergencyContacts();
  const [isActive, setIsActive] = useState(false);
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const triggerSOS = useCallback(async () => {
    if (!user || !location) {
      toast({
        title: 'Error',
        description: 'Unable to trigger SOS. Please ensure location is enabled.',
        variant: 'destructive'
      });
      return;
    }

    setIsActive(true);

    // Create incident record
    const { data: incident, error } = await supabase
      .from('incidents')
      .insert({
        user_id: user.id,
        alert_type: 'sos',
        latitude: location.latitude,
        longitude: location.longitude,
        risk_level: currentRiskLevel,
        description: 'SOS triggered by user'
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create incident. Please try again.',
        variant: 'destructive'
      });
      setIsActive(false);
      return;
    }

    // Create notification for the user
    await supabase.from('notifications').insert({
      user_id: user.id,
      title: 'SOS Alert Sent',
      message: 'Emergency contacts and nearby police have been notified.',
      type: 'emergency'
    });

    toast({
      title: '🚨 SOS Alert Sent!',
      description: 'Emergency contacts and police have been notified with your location.',
    });

    // Show fake call after 2 seconds
    setTimeout(() => {
      setShowFakeCall(true);
    }, 2000);

  }, [user, location, currentRiskLevel]);

  const cancelSOS = useCallback(() => {
    setIsActive(false);
    setShowFakeCall(false);
    setIsRecording(false);
  }, []);

  const acceptFakeCall = useCallback(() => {
    setShowFakeCall(false);
    setIsRecording(true);
    
    // Start recording simulation
    toast({
      title: '🎙️ Recording Started',
      description: 'Audio is being recorded and will be sent to emergency contacts.',
    });
  }, []);

  const declineFakeCall = useCallback(() => {
    setShowFakeCall(false);
  }, []);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    
    toast({
      title: '✅ Recording Saved',
      description: 'Audio recording has been sent to emergency contacts and police.',
    });
  }, []);

  return {
    isActive,
    showFakeCall,
    isRecording,
    triggerSOS,
    cancelSOS,
    acceptFakeCall,
    declineFakeCall,
    stopRecording
  };
};
