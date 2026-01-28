import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, User } from 'lucide-react';
import { useSOS } from '@/contexts/SOSContext';

const FakeCallModal: React.FC = () => {
  const { showFakeCall, acceptFakeCall, declineFakeCall } = useSOS();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (showFakeCall) {
      // Create ringtone audio
      const audio = new Audio('https://www.soundjay.com/phone/sounds/phone-calling-1.mp3');
      audio.loop = true;
      audio.volume = 0.7;
      audio.play().catch(console.error);
      audioRef.current = audio;
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [showFakeCall]);

  return (
    <AnimatePresence>
      {showFakeCall && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-gray-900 to-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Header */}
          <div className="flex-1 flex flex-col items-center justify-center pt-20">
            <motion.div
              className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-[hsl(320,70%,50%)] flex items-center justify-center mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <User className="w-16 h-16 text-white" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-white mb-2">Mom</h2>
            <p className="text-lg text-gray-400">Incoming call...</p>
          </div>

          {/* Call Actions */}
          <div className="pb-16 px-8">
            <div className="flex justify-center gap-20">
              {/* Decline Button */}
              <motion.button
                onClick={declineFakeCall}
                className="flex flex-col items-center gap-3"
                whileTap={{ scale: 0.9 }}
              >
                <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                  <PhoneOff className="w-8 h-8 text-white" />
                </div>
                <span className="text-gray-400 text-sm">Decline</span>
              </motion.button>

              {/* Accept Button */}
              <motion.button
                onClick={acceptFakeCall}
                className="flex flex-col items-center gap-3"
                whileTap={{ scale: 0.9 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <span className="text-gray-400 text-sm">Accept</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FakeCallModal;
