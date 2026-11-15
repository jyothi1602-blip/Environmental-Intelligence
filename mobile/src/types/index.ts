export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  ageGroup: string;
  gender?: string;
  city: string;
  token?: string;
  hasCompletedHealthProfile: boolean;
  hasLocationConsent: boolean;
  createdAt?: string;
}

export interface HealthProfile {
  conditions: string[];
  sensitivityGroup: 'General' | 'Children' | 'Elderly' | 'Sensitive individuals';
  additionalNotes?: string;
  consentGiven: boolean;
  updatedAt?: string;
}

export interface LocationConsent {
  gpsAllowed: boolean;
  latitude?: number;
  longitude?: number;
  city: string;
  consentGiven: boolean;
  updatedAt?: string;
}

export interface PollutantDetail {
  name: string;
  symbol: string;
  concentration: number | null;
  unit: string;
  status: string;
  status_color: string;
  timestamp: string;
}

export interface AQIData {
  aqi: number;
  category: string;
  color: string;
  dominant_pollutant: string;
  station_name: string;
  latitude: number;
  longitude: number;
  pollutants: Record<string, PollutantDetail>;
  source: string;
  is_demo_mode: boolean;
  timestamp: string;
}

export interface WeatherData {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  weather_condition: string;
  condition_icon: string;
  source: string;
  timestamp: string;
}

export interface TrafficData {
  status: string;
  congestion_level: string;
  congestion_index: number;
  speed_reduction_pct: number;
  source: string;
  is_available: boolean;
  note: string;
  timestamp: string;
}

export interface AlertItem {
  id: string;
  title: string;
  severity: 'info' | 'warning' | 'danger' | 'critical';
  severity_color: string;
  category: string;
  message: string;
  action_advice: string;
  affected_groups: string[];
  timestamp: string;
}

export interface PersonalizedAlerts {
  user_id?: number;
  sensitivity_group: string;
  conditions_detected: string[];
  aqi_level: number;
  aqi_category: string;
  alerts: AlertItem[];
  total_alerts: number;
  disclaimer: string;
}

export interface HistoricalDataPoint {
  timestamp: string;
  aqi: number;
  pm25?: number;
  pm10?: number;
  no2?: number;
  o3?: number;
  co?: number;
  temperature?: number;
  humidity?: number;
}

