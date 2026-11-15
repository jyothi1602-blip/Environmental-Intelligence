import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { userStorage } from '../storage/userStorage';
import { apiService } from '../services/apiService';

interface Station {
  id: string;
  name: string;
  distanceKm: number;
  aqi: number;
  category: string;
  color: string;
  dominant: string;
  lat: number;
  lon: number;
}

export const MapScreen: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [userLocation, setUserLocation] = useState<{ city: string; lat: number; lon: number }>({
    city: 'Delhi',
    lat: 28.6139,
    lon: 77.2090,
  });

  const stations: Station[] = [
    { id: 'st1', name: 'Central Environmental Node #1', distanceKm: 1.8, aqi: 142, category: 'Unhealthy for Sensitive', color: '#F97316', dominant: 'PM2.5', lat: 28.6139, lon: 77.2090 },
    { id: 'st2', name: 'Industrial Corridor Sensor #4', distanceKm: 4.2, aqi: 178, category: 'Unhealthy', color: '#EF4444', dominant: 'PM10', lat: 28.6320, lon: 77.2180 },
    { id: 'st3', name: 'Botanical Garden Eco Node', distanceKm: 6.5, aqi: 78, category: 'Moderate', color: '#F59E0B', dominant: 'O3', lat: 28.5900, lon: 77.1900 },
    { id: 'st4', name: 'University Campus Telemetry', distanceKm: 8.1, aqi: 112, category: 'Unhealthy for Sensitive', color: '#F97316', dominant: 'PM2.5', lat: 28.6450, lon: 77.1850 },
  ];

  useEffect(() => {
    (async () => {
      const loc = await userStorage.getLocationConsent();
      if (loc) {
        setUserLocation({
          city: loc.city || 'Delhi',
          lat: loc.latitude || 28.6139,
          lon: loc.longitude || 77.2090,
        });
      }
      setSelectedStation(stations[0]);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Regional Pollution Map</Text>
          <Text style={styles.subtitle}>Nearby telemetry stations and atmospheric sensors</Text>
        </View>

        {/* Visual Map Canvas / Radar Mockup */}
        <View style={styles.mapCanvas}>
          <View style={styles.gridOverlay}>
            <View style={styles.radarRing1} />
            <View style={styles.radarRing2} />
            <View style={styles.radarRing3} />
          </View>

          {/* User Location Center Marker */}
          <View style={styles.userMarker}>
            <View style={styles.userPulse} />
            <View style={styles.userPin}>
              <Feather name="navigation" size={14} color={COLORS.textWhite} />
            </View>
            <Text style={styles.userLabel}>You ({userLocation.city})</Text>
          </View>

          {/* Station Pins */}
          {stations.map((st, idx) => {
            const isSelected = selectedStation?.id === st.id;
            // Spread pins graphically around user center
            const offsets = [
              { top: 50, right: 60 },
              { top: 120, right: 30 },
              { bottom: 50, left: 50 },
              { top: 40, left: 40 },
            ];
            const pos = offsets[idx % offsets.length];

            return (
              <TouchableOpacity
                key={st.id}
                style={[styles.stationPin, pos, isSelected && styles.stationPinSelected]}
                onPress={() => setSelectedStation(st)}
                activeOpacity={0.8}
              >
                <View style={[styles.pinBadge, { backgroundColor: st.color }]}>
                  <Text style={styles.pinAqiText}>{st.aqi}</Text>
                </View>
                {isSelected && (
                  <View style={styles.pinSelectedIndicator} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Station Card */}
        {selectedStation && (
          <View style={[styles.selectedCard, { borderLeftColor: selectedStation.color, borderLeftWidth: 4 }]}>
            <View style={styles.selectedTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedName}>{selectedStation.name}</Text>
                <Text style={styles.selectedDist}>
                  <Feather name="map-pin" size={11} color={COLORS.textMuted} /> {selectedStation.distanceKm} km away from your location
                </Text>
              </View>
              <View style={[styles.selectedAqiBadge, { backgroundColor: selectedStation.color + '20' }]}>
                <Text style={[styles.selectedAqiNum, { color: selectedStation.color }]}>{selectedStation.aqi}</Text>
                <Text style={[styles.selectedAqiLabel, { color: selectedStation.color }]}>AQI</Text>
              </View>
            </View>

            <View style={styles.selectedDetailsRow}>
              <Text style={styles.selectedCategory}>{selectedStation.category}</Text>
              <Text style={styles.selectedDominant}>Dominant: {selectedStation.dominant}</Text>
            </View>
          </View>
        )}

        {/* Station List */}
        <View style={styles.stationListSection}>
          <Text style={styles.listSectionTitle}>All Nearby Stations ({stations.length})</Text>
          <View style={styles.list}>
            {stations.map((st) => (
              <TouchableOpacity
                key={st.id}
                style={[styles.listItem, selectedStation?.id === st.id && styles.listItemSelected]}
                onPress={() => setSelectedStation(st)}
              >
                <View style={[styles.listDot, { backgroundColor: st.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.listName}>{st.name}</Text>
                  <Text style={styles.listSub}>{st.distanceKm} km • {st.category}</Text>
                </View>
                <Text style={[styles.listAqi, { color: st.color }]}>{st.aqi} AQI</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
    paddingBottom: 28,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  mapCanvas: {
    height: 240,
    backgroundColor: '#0F2B26',
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRing1: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: '#1B5E50',
    position: 'absolute',
  },
  radarRing2: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: '#14463C',
    position: 'absolute',
  },
  radarRing3: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1,
    borderColor: '#0D362E',
    position: 'absolute',
  },
  userMarker: {
    alignItems: 'center',
    zIndex: 10,
  },
  userPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
  },
  userPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.textWhite,
  },
  userLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textWhite,
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stationPin: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  stationPinSelected: {
    transform: [{ scale: 1.15 }],
    zIndex: 8,
  },
  pinBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.textWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  pinAqiText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textWhite,
  },
  pinSelectedIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.textWhite,
    marginTop: 2,
  },
  selectedCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  selectedDist: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  selectedAqiBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedAqiNum: {
    fontSize: 18,
    fontWeight: '900',
  },
  selectedAqiLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
  selectedDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
  },
  selectedCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  selectedDominant: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  stationListSection: {
    gap: 8,
  },
  listSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  list: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  listItemSelected: {
    borderColor: COLORS.accent,
    backgroundColor: '#F0FDF4',
  },
  listDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  listName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  listSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  listAqi: {
    fontSize: 13,
    fontWeight: '800',
  },
});
