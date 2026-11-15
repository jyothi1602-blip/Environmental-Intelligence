import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, ScrollView, SafeAreaView,
  TouchableOpacity, RefreshControl, ActivityIndicator
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { AQICard } from '../components/AQICard';
import { PollutantsGrid } from '../components/PollutantCard';
import { WeatherCard } from '../components/WeatherCard';
import { TrafficCard } from '../components/TrafficCard';
import { AlertCard } from '../components/AlertCard';
import { apiService } from '../services/apiService';
import { userStorage } from '../storage/userStorage';
import { UserProfile, AQIData, WeatherData, TrafficData, PersonalizedAlerts } from '../types';

interface Props {
  user: UserProfile;
}

export const DashboardScreen: React.FC<Props> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentCity, setCurrentCity] = useState(user.city || 'Delhi');
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [alertsData, setAlertsData] = useState<PersonalizedAlerts | null>(null);

  const firstName = user.fullName.split(' ')[0] || user.fullName;

  const loadData = async () => {
    try {
      const loc = await userStorage.getLocationConsent();
      const city = loc?.city || user.city || 'Delhi';
      const lat = loc?.latitude || 28.6139;
      const lon = loc?.longitude || 77.2090;
      setCurrentCity(city);

      const [aqi, weather, traffic, alerts] = await Promise.all([
        apiService.fetchAQI(lat, lon, city),
        apiService.fetchWeather(lat, lon, city),
        apiService.fetchTraffic(lat, lon, city),
        apiService.fetchAlerts(lat, lon, city, user.token),
      ]);

      setAqiData(aqi);
      setWeatherData(weather);
      setTrafficData(traffic);
      setAlertsData(alerts);
    } catch (e) {
      console.warn('Dashboard load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Section A: Welcome and Location Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.greetingRow}>
              <Text style={styles.greetingText}>Hello, {firstName}</Text>
              <Text style={styles.waveEmoji}>👋</Text>
            </View>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={14} color={COLORS.accent} />
              <Text style={styles.locationText}>{currentCity}</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
            activeOpacity={0.7}
          >
            <Feather name="refresh-cw" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching atmospheric sensor readings...</Text>
          </View>
        ) : (
          <>
            {/* Section B: Main AQI Card */}
            {aqiData && <AQICard data={aqiData} />}

            {/* Section F: Personalized Health Alerts */}
            {alertsData && <AlertCard alertsData={alertsData} />}

            {/* Section C: Pollutant Monitoring Cards */}
            {aqiData && <PollutantsGrid pollutants={aqiData.pollutants} />}

            {/* Section D: Weather Information */}
            {weatherData && <WeatherCard weather={weatherData} />}

            {/* Section E: Traffic and Mobility */}
            {trafficData && <TrafficCard traffic={trafficData} />}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  waveEmoji: {
    fontSize: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dotSeparator: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});

