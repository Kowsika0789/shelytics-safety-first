import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { RiskZone, RiskLevel } from '@/types/database';

interface LocationData {
  latitude: number;
  longitude: number;
  speed: number;
  accuracy: number;
  heading: number;
  timestamp: number;
}

interface LocationContextType {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  riskZones: RiskZone[];
  currentRiskLevel: RiskLevel;
  currentRiskScore: number;
  nearbyRiskZone: RiskZone | null;
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  startTracking: () => void;
  stopTracking: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get time-adjusted risk score
const getAdjustedRiskScore = (zone: RiskZone): number => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  let score = zone.risk_score;

  // Night time multiplier (10 PM - 6 AM)
  if (hour >= 22 || hour < 6) {
    score *= zone.time_factors?.night_multiplier || 1.5;
  }

  // Weekend multiplier
  if (day === 0 || day === 6) {
    score *= zone.time_factors?.weekend_multiplier || 1.2;
  }

  return Math.min(100, Math.round(score));
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [currentRiskLevel, setCurrentRiskLevel] = useState<RiskLevel>('safe');
  const [currentRiskScore, setCurrentRiskScore] = useState(0);
  const [nearbyRiskZone, setNearbyRiskZone] = useState<RiskZone | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Fetch risk zones
  useEffect(() => {
    const fetchRiskZones = async () => {
      const { data, error } = await supabase
        .from('risk_zones')
        .select('*')
        .eq('is_active', true);

      if (!error && data) {
        setRiskZones(data as RiskZone[]);
      }
    };

    fetchRiskZones();
  }, []);

  // Evaluate risk based on location
  const evaluateRisk = useCallback((lat: number, lon: number) => {
    let highestScore = 0;
    let closestZone: RiskZone | null = null;

    for (const zone of riskZones) {
      const distance = calculateDistance(lat, lon, zone.latitude, zone.longitude);

      if (distance <= zone.radius_meters) {
        const adjustedScore = getAdjustedRiskScore(zone);
        if (adjustedScore > highestScore) {
          highestScore = adjustedScore;
          closestZone = zone;
        }
      }
    }

    setCurrentRiskScore(highestScore);
    setNearbyRiskZone(closestZone);

    if (highestScore >= 70) {
      setCurrentRiskLevel('emergency');
    } else if (highestScore >= 40) {
      setCurrentRiskLevel('at_risk');
    } else {
      setCurrentRiskLevel('safe');
    }
  }, [riskZones]);

  // Log location to database
  const logLocation = useCallback(async (data: LocationData) => {
    if (!user) return;

    await supabase.from('location_logs').insert({
      user_id: user.id,
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed,
      accuracy: data.accuracy,
      heading: data.heading
    });
  }, [user]);

  const requestPermission = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissionGranted(true);
          setError(null);
          resolve(true);
        },
        (err) => {
          setError(err.message);
          setPermissionGranted(false);
          resolve(false);
        }
      );
    });
  };

  const startTracking = useCallback(() => {
    if (!navigator.geolocation || !permissionGranted) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const data: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed || 0,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading || 0,
          timestamp: position.timestamp
        };

        setLocation(data);
        setLoading(false);
        evaluateRisk(data.latitude, data.longitude);

        // Log location every 30 seconds
        if (user) {
          logLocation(data);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    setWatchId(id);
  }, [permissionGranted, user, evaluateRisk, logLocation]);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <LocationContext.Provider value={{
      location,
      loading,
      error,
      riskZones,
      currentRiskLevel,
      currentRiskScore,
      nearbyRiskZone,
      permissionGranted,
      requestPermission,
      startTracking,
      stopTracking
    }}>
      {children}
    </LocationContext.Provider>
  );
};
