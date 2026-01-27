import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Shield, AlertTriangle } from 'lucide-react';
import SafetyMap from '@/components/map/SafetyMap';
import RiskIndicator from '@/components/status/RiskIndicator';
import SpeedDisplay from '@/components/status/SpeedDisplay';
import SOSButton from '@/components/sos/SOSButton';
import FakeCallModal from '@/components/sos/FakeCallModal';
import NotificationPanel from '@/components/notifications/NotificationPanel';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import logo from '@/assets/shelytics-logo.png';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { location, permissionGranted, startTracking, currentRiskLevel } = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (profile && !profile.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    if (permissionGranted) {
      startTracking();
    }
  }, [permissionGranted, startTracking]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Shield className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <FakeCallModal />
      
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 pt-safe">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SHElytics" className="w-10 h-10" />
            <div>
              <h1 className="font-semibold text-foreground">SHElytics</h1>
              <p className="text-xs text-muted-foreground">
                {location ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location Active
                  </span>
                ) : (
                  'Enable GPS for protection'
                )}
              </p>
            </div>
          </div>
          <NotificationPanel />
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4">
        {/* Welcome Card */}
        <motion.div
          className="bg-gradient-to-r from-primary to-[hsl(320,70%,50%)] rounded-2xl p-5 text-primary-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold">
            Hello, {profile?.name || 'there'}! 👋
          </h2>
          <p className="text-primary-foreground/80 text-sm mt-1">
            {currentRiskLevel === 'safe' 
              ? 'You are currently in a safe zone. Stay vigilant!'
              : currentRiskLevel === 'at_risk'
              ? 'Caution: You are in a moderate risk area.'
              : 'Alert: High risk zone detected. Stay safe!'}
          </p>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SafetyMap height="280px" />
        </motion.div>

        {/* Status Cards */}
        <div className="grid gap-4">
          <RiskIndicator />
          <SpeedDisplay />
        </div>

        {/* Quick Actions */}
        <motion.div
          className="bg-card rounded-2xl p-4 border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => navigate('/safety')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-safe/10 hover:bg-safe/20 transition-colors"
            >
              <Shield className="w-6 h-6 text-safe" />
              <span className="text-xs font-medium text-foreground">Safety Tips</span>
            </button>
            <button 
              onClick={() => navigate('/map')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <MapPin className="w-6 h-6 text-primary" />
              <span className="text-xs font-medium text-foreground">Full Map</span>
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-risk/10 hover:bg-risk/20 transition-colors"
            >
              <AlertTriangle className="w-6 h-6 text-risk" />
              <span className="text-xs font-medium text-foreground">Contacts</span>
            </button>
          </div>
        </motion.div>
      </main>

      {/* Floating SOS Button */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-30">
        <SOSButton />
      </div>

      <BottomNavigation />
    </div>
  );
};

export default HomePage;
