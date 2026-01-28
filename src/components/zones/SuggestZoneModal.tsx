import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, AlertTriangle, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from '@/contexts/LocationContext';
import { useZoneSuggestions, CreateZoneSuggestionInput } from '@/hooks/useZoneSuggestions';
import { RiskLevel } from '@/types/database';

interface SuggestZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const riskLevelOptions: { value: RiskLevel; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'safe', label: 'Safe', icon: <Shield className="w-4 h-4" />, color: 'text-safe' },
  { value: 'at_risk', label: 'Moderate Risk', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-risk' },
  { value: 'emergency', label: 'High Risk', icon: <AlertCircle className="w-4 h-4" />, color: 'text-emergency' },
];

const SuggestZoneModal: React.FC<SuggestZoneModalProps> = ({ isOpen, onClose }) => {
  const { location } = useLocation();
  const { createSuggestion } = useZoneSuggestions();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('at_risk');
  const [radius, setRadius] = useState('200');
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    const lat = useCurrentLocation ? location?.latitude : parseFloat(customLat);
    const lng = useCurrentLocation ? location?.longitude : parseFloat(customLng);

    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
      return;
    }

    setSubmitting(true);

    const input: CreateZoneSuggestionInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      latitude: lat,
      longitude: lng,
      radius_meters: parseInt(radius) || 200,
      suggested_risk_level: riskLevel,
    };

    const success = await createSuggestion(input);

    setSubmitting(false);

    if (success) {
      setName('');
      setDescription('');
      setRiskLevel('at_risk');
      setRadius('200');
      setCustomLat('');
      setCustomLng('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-card border border-border p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Suggest a Risk Zone</h2>
              <Button variant="ghost" size="icon-sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Report an area you believe is unsafe. Admins will review your suggestion.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Zone Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Dark Alley near Main St"
                  required
                  maxLength={100}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Description (optional)</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why is this area unsafe?"
                  maxLength={500}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Risk Level</label>
                <div className="flex gap-2">
                  {riskLevelOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRiskLevel(option.value)}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                        riskLevel === option.value
                          ? `border-2 ${option.color} bg-muted`
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <span className={option.color}>{option.icon}</span>
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Radius (meters)</label>
                <Input
                  type="number"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  min={50}
                  max={2000}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setUseCurrentLocation(true)}
                    className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                      useCurrentLocation
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Current Location
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCurrentLocation(false)}
                    className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                      !useCurrentLocation
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {useCurrentLocation ? (
                  <p className="text-xs text-muted-foreground">
                    {location
                      ? `Using: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                      : 'Location not available. Enable GPS first.'}
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="any"
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      placeholder="Latitude"
                      required={!useCurrentLocation}
                    />
                    <Input
                      type="number"
                      step="any"
                      value={customLng}
                      onChange={(e) => setCustomLng(e.target.value)}
                      placeholder="Longitude"
                      required={!useCurrentLocation}
                    />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  submitting ||
                  !name.trim() ||
                  (useCurrentLocation && !location) ||
                  (!useCurrentLocation && (!customLat || !customLng))
                }
              >
                {submitting ? 'Submitting...' : 'Submit Suggestion'}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuggestZoneModal;
