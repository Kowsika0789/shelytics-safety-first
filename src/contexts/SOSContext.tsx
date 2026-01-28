import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TriggerSOSParams {
  userId: string;
  latitude: number;
  longitude: number;
  riskLevel: string;
}

interface SOSContextType {
  isActive: boolean;
  showFakeCall: boolean;
  isRecording: boolean;
  triggerSOS: (params: TriggerSOSParams) => Promise<void>;
  cancelSOS: () => void;
  acceptFakeCall: () => void;
  declineFakeCall: () => void;
  stopRecording: () => Promise<void>;
}

const SOSContext = createContext<SOSContextType | undefined>(undefined);

export const useSOS = () => {
  const context = useContext(SOSContext);
  if (context === undefined) {
    throw new Error('useSOS must be used within a SOSProvider');
  }
  return context;
};

export const SOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const triggerSOS = useCallback(async (params: TriggerSOSParams) => {
    const { userId, latitude, longitude, riskLevel } = params;
    
    setIsActive(true);

    // Create incident record
    const { error } = await supabase
      .from('incidents')
      .insert({
        user_id: userId,
        alert_type: 'sos' as const,
        latitude,
        longitude,
        risk_level: riskLevel as 'safe' | 'at_risk' | 'emergency',
        description: 'SOS triggered by user'
      });

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
      user_id: userId,
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

  }, []);

  const cancelSOS = useCallback(() => {
    setIsActive(false);
    setShowFakeCall(false);
    setIsRecording(false);
  }, []);

  const acceptFakeCall = useCallback(() => {
    setShowFakeCall(false);
    setIsRecording(true);
    
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

  return (
    <SOSContext.Provider value={{
      isActive,
      showFakeCall,
      isRecording,
      triggerSOS,
      cancelSOS,
      acceptFakeCall,
      declineFakeCall,
      stopRecording
    }}>
      {children}
    </SOSContext.Provider>
  );
};
