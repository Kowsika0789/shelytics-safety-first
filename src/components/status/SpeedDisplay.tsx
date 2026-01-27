import React from 'react';
import { motion } from 'framer-motion';
import { Gauge, Navigation } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';

const SpeedDisplay: React.FC = () => {
  const { location } = useLocation();
  
  // Convert m/s to km/h
  const speedKmh = location?.speed ? (location.speed * 3.6).toFixed(1) : '0.0';
  const heading = location?.heading || 0;

  const getSpeedStatus = () => {
    const speed = parseFloat(speedKmh);
    if (speed === 0) return { label: 'Stationary', color: 'text-muted-foreground' };
    if (speed < 5) return { label: 'Walking', color: 'text-safe' };
    if (speed < 20) return { label: 'Running/Cycling', color: 'text-risk' };
    return { label: 'In Vehicle', color: 'text-primary' };
  };

  const status = getSpeedStatus();

  return (
    <motion.div
      className="bg-card rounded-2xl p-4 border border-border shadow-soft"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="p-3 rounded-xl bg-primary/10">
            <Gauge className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{speedKmh}</span>
            <span className="text-sm text-muted-foreground">km/h</span>
          </div>
          <p className={`text-sm font-medium ${status.color}`}>{status.label}</p>
        </div>

        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: heading }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <Navigation className="w-5 h-5 text-primary" />
          </motion.div>
          <span className="text-xs text-muted-foreground mt-1">
            {Math.round(heading)}°
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default SpeedDisplay;
