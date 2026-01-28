import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafetyMap from '@/components/map/SafetyMap';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import SOSButton from '@/components/sos/SOSButton';
import FakeCallModal from '@/components/sos/FakeCallModal';
import SuggestZoneModal from '@/components/zones/SuggestZoneModal';
import MySuggestionsList from '@/components/zones/MySuggestionsList';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { Shield, MapPin, AlertTriangle, AlertCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react';

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { riskZones, currentRiskLevel, permissionGranted, requestPermission, startTracking } = useLocation();
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showMySuggestions, setShowMySuggestions] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Request location permission and start tracking
  useEffect(() => {
    const initLocation = async () => {
      if (!permissionGranted) {
        const granted = await requestPermission();
        if (granted) {
          startTracking();
        }
      } else {
        startTracking();
      }
    };
    initLocation();
  }, [permissionGranted, requestPermission, startTracking]);

  // Count risk zones by level
  const zoneCounts = {
    safe: riskZones.filter(z => z.risk_level === 'safe').length,
    at_risk: riskZones.filter(z => z.risk_level === 'at_risk').length,
    emergency: riskZones.filter(z => z.risk_level === 'emergency').length,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Shield className="w-12 h-12 text-primary animate-spin-slow" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <FakeCallModal />
      <SuggestZoneModal isOpen={showSuggestModal} onClose={() => setShowSuggestModal(false)} />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 pt-safe">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-foreground">Safety Map</h1>
            <p className="text-xs text-muted-foreground">
              Risk zones in your area
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSuggestModal(true)}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Report Zone
            </Button>
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              currentRiskLevel === 'safe' ? 'bg-safe/10 text-safe' :
              currentRiskLevel === 'at_risk' ? 'bg-risk/10 text-risk' :
              'bg-emergency/10 text-emergency'
            }`}>
              {currentRiskLevel === 'safe' ? 'Safe Zone' :
               currentRiskLevel === 'at_risk' ? 'Caution' : 'High Risk'}
            </div>
          </div>
        </div>
      </header>

      {/* Full Map */}
      <div className="relative" style={{ height: 'calc(100vh - 200px)' }}>
        <SafetyMap height="100%" />
        
        {/* Map Legend */}
        <motion.div
          className="absolute top-4 left-4 bg-card/90 backdrop-blur-xl rounded-xl p-3 border border-border shadow-medium"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-xs font-semibold text-foreground mb-2">Risk Zones</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-safe" />
              <span className="text-xs text-muted-foreground">Safe ({zoneCounts.safe})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-risk" />
              <span className="text-xs text-muted-foreground">Moderate ({zoneCounts.at_risk})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emergency" />
              <span className="text-xs text-muted-foreground">High Risk ({zoneCounts.emergency})</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Zone Info */}
      <div className="px-4 py-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Nearby Risk Zones</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {riskZones.slice(0, 5).map((zone) => (
            <motion.div
              key={zone.id}
              className={`flex-shrink-0 w-48 p-3 rounded-xl border ${
                zone.risk_level === 'safe' ? 'bg-safe/10 border-safe/30' :
                zone.risk_level === 'at_risk' ? 'bg-risk/10 border-risk/30' :
                'bg-emergency/10 border-emergency/30'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-2">
                {zone.risk_level === 'safe' ? (
                  <Shield className="w-4 h-4 text-safe" />
                ) : zone.risk_level === 'at_risk' ? (
                  <AlertTriangle className="w-4 h-4 text-risk" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-emergency" />
                )}
                <span className={`text-xs font-medium ${
                  zone.risk_level === 'safe' ? 'text-safe' :
                  zone.risk_level === 'at_risk' ? 'text-risk' : 'text-emergency'
                }`}>
                  {zone.risk_score}% Risk
                </span>
              </div>
              <h4 className="font-medium text-foreground text-sm truncate">{zone.name}</h4>
              <p className="text-xs text-muted-foreground truncate">{zone.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* My Suggestions Section */}
      <div className="px-4 pb-4">
        <button
          onClick={() => setShowMySuggestions(!showMySuggestions)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border"
        >
          <span className="text-sm font-semibold text-foreground">My Zone Suggestions</span>
          {showMySuggestions ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {showMySuggestions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3"
          >
            <MySuggestionsList />
          </motion.div>
        )}
      </div>

      {/* Floating SOS Button */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-30">
        <SOSButton />
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MapPage;
