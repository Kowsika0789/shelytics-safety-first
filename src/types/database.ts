export type RiskLevel = 'safe' | 'at_risk' | 'emergency';
export type AlertType = 'sos' | 'auto_risk_zone' | 'speed_alert';
export type AlertStatus = 'pending' | 'acknowledged' | 'resolved';
export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  age?: number;
  phone?: string;
  address?: string;
  avatar_url?: string;
  onboarding_completed: boolean;
  gps_enabled: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocationLog {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  speed?: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  timestamp: string;
}

export interface RiskZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  risk_score: number;
  risk_level: RiskLevel;
  incident_count: number;
  time_factors?: {
    night_multiplier?: number;
    weekend_multiplier?: number;
  };
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  user_id: string;
  alert_type: AlertType;
  status: AlertStatus;
  latitude: number;
  longitude: number;
  risk_level?: RiskLevel;
  description?: string;
  audio_url?: string;
  police_notified: boolean;
  contacts_notified: boolean;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PoliceStation {
  id: string;
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  address?: string;
  is_active: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
}
