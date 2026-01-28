import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useSOS } from '@/contexts/SOSContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { toast } from '@/hooks/use-toast';

const SOSButton: React.FC = () => {
  const { isActive, triggerSOS, cancelSOS } = useSOS();
  const { user } = useAuth();
  const { location, currentRiskLevel } = useLocation();

  const handleTriggerSOS = async () => {
    if (!user || !location) {
      toast({
        title: 'Error',
        description: 'Unable to trigger SOS. Please ensure location is enabled.',
        variant: 'destructive'
      });
      return;
    }

    await triggerSOS({
      userId: user.id,
      latitude: location.latitude,
      longitude: location.longitude,
      riskLevel: currentRiskLevel
    });
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings */}
      <AnimatePresence>
        {!isActive && (
          <>
            <motion.div
              className="absolute w-20 h-20 rounded-full bg-emergency/20"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute w-20 h-20 rounded-full bg-emergency/30"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main SOS Button */}
      <motion.button
        onClick={isActive ? cancelSOS : handleTriggerSOS}
        className={`sos-button ${isActive ? 'w-20 h-20' : 'w-20 h-20'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isActive ? {
          boxShadow: [
            '0 0 20px 5px rgba(239, 68, 68, 0.4)',
            '0 0 40px 10px rgba(239, 68, 68, 0.6)',
            '0 0 20px 5px rgba(239, 68, 68, 0.4)'
          ]
        } : {}}
        transition={isActive ? { duration: 1, repeat: Infinity } : {}}
      >
        <div className="flex flex-col items-center justify-center">
          {isActive ? (
            <X className="w-8 h-8" />
          ) : (
            <span className="text-xl font-bold tracking-wide">SOS</span>
          )}
        </div>
      </motion.button>
    </div>
  );
};

export default SOSButton;
