import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, AlertCircle } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';
import { RiskLevel } from '@/types/database';

interface StatusConfig {
  icon: React.ElementType;
  label: string;
  description: string;
  className: string;
  iconClassName: string;
}

const statusConfigs: Record<RiskLevel, StatusConfig> = {
  safe: {
    icon: Shield,
    label: 'Safe Zone',
    description: 'You are in a safe area',
    className: 'status-card status-safe',
    iconClassName: 'text-safe'
  },
  at_risk: {
    icon: AlertTriangle,
    label: 'Caution',
    description: 'Moderate risk area detected',
    className: 'status-card status-risk risk-pulse',
    iconClassName: 'text-risk'
  },
  emergency: {
    icon: AlertCircle,
    label: 'High Risk',
    description: 'Leave area if possible',
    className: 'status-card status-emergency risk-pulse',
    iconClassName: 'text-emergency'
  }
};

const RiskIndicator: React.FC = () => {
  const { currentRiskLevel, currentRiskScore, nearbyRiskZone } = useLocation();
  const config = statusConfigs[currentRiskLevel];
  const Icon = config.icon;

  return (
    <motion.div
      className={config.className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={currentRiskLevel}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-white/50 ${config.iconClassName}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{config.label}</h3>
            <span className={`text-sm font-bold ${config.iconClassName}`}>
              {currentRiskScore}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
          {nearbyRiskZone && (
            <p className="text-xs text-muted-foreground mt-2">
              📍 {nearbyRiskZone.name}
            </p>
          )}
        </div>
      </div>

      {/* Risk Progress Bar */}
      <div className="mt-4">
        <div className="h-2 bg-white/30 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              currentRiskLevel === 'emergency' ? 'bg-emergency' :
              currentRiskLevel === 'at_risk' ? 'bg-risk' : 'bg-safe'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${currentRiskScore}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Safe</span>
          <span>Moderate</span>
          <span>High Risk</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RiskIndicator;
