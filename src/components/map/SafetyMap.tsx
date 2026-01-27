import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '@/contexts/LocationContext';
import { RiskZone } from '@/types/database';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom user location marker
const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, hsl(340, 75%, 55%) 0%, hsl(320, 70%, 50%) 100%);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 20px rgba(219, 39, 119, 0.5);
      ">
        <div style="
          position: absolute;
          width: 40px;
          height: 40px;
          background: hsla(340, 75%, 55%, 0.2);
          border-radius: 50%;
          top: -11px;
          left: -11px;
          animation: pulse-ring 2s ease-out infinite;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Get risk zone color
const getRiskColor = (riskLevel: string, riskScore: number): string => {
  if (riskLevel === 'emergency' || riskScore >= 70) {
    return 'rgba(239, 68, 68, 0.5)'; // Red
  } else if (riskLevel === 'at_risk' || riskScore >= 40) {
    return 'rgba(245, 158, 11, 0.5)'; // Yellow/Orange
  }
  return 'rgba(34, 197, 94, 0.5)'; // Green
};

const getRiskBorderColor = (riskLevel: string, riskScore: number): string => {
  if (riskLevel === 'emergency' || riskScore >= 70) {
    return 'rgb(239, 68, 68)';
  } else if (riskLevel === 'at_risk' || riskScore >= 40) {
    return 'rgb(245, 158, 11)';
  }
  return 'rgb(34, 197, 94)';
};

// Component to update map center when location changes
const MapUpdater: React.FC<{ latitude: number; longitude: number }> = ({ latitude, longitude }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom());
  }, [latitude, longitude, map]);
  
  return null;
};

interface SafetyMapProps {
  className?: string;
  height?: string;
}

const SafetyMap: React.FC<SafetyMapProps> = ({ className = '', height = '100%' }) => {
  const { location, riskZones } = useLocation();
  const userIcon = useRef(createUserIcon());
  
  // Default location (New York) if user location not available
  const defaultLat = 40.7128;
  const defaultLng = -74.0060;
  
  const lat = location?.latitude ?? defaultLat;
  const lng = location?.longitude ?? defaultLng;

  return (
    <div className={`map-container ${className}`} style={{ height }}>
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Risk Zone Circles */}
        {riskZones.map((zone: RiskZone) => (
          <Circle
            key={zone.id}
            center={[zone.latitude, zone.longitude]}
            radius={zone.radius_meters}
            pathOptions={{
              color: getRiskBorderColor(zone.risk_level, zone.risk_score),
              fillColor: getRiskColor(zone.risk_level, zone.risk_score),
              fillOpacity: 0.3,
              weight: 2,
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-foreground">{zone.name}</h3>
                <p className="text-sm text-muted-foreground">{zone.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    zone.risk_level === 'emergency' ? 'bg-emergency' :
                    zone.risk_level === 'at_risk' ? 'bg-risk' : 'bg-safe'
                  }`}></span>
                  <span className="text-sm font-medium">Risk Score: {zone.risk_score}%</span>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}
        
        {/* User Location Marker */}
        {location && (
          <>
            <Marker position={[lat, lng]} icon={userIcon.current}>
              <Popup>
                <div className="p-2 text-center">
                  <p className="font-semibold text-primary">Your Location</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {location.speed ? `Speed: ${(location.speed * 3.6).toFixed(1)} km/h` : 'Stationary'}
                  </p>
                </div>
              </Popup>
            </Marker>
            <MapUpdater latitude={lat} longitude={lng} />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default SafetyMap;
