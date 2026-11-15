import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { apiService } from '../services/apiService';
import { userStorage } from '../storage/userStorage';
import { AQIData, PollutantDetail } from '../types';

export const AirQualityScreen: React.FC = () => {
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const loc = await userStorage.getLocationConsent();
      const data = await apiService.fetchAQI(loc?.latitude || 28.6139, loc?.longitude || 77.2090, loc?.city || 'Delhi');
      setAqiData(data);
      setLoading(false);
    })();
  }, []);

  const standards = [
    {
      key: 'pm25',
      name: 'PM2.5 (Fine Particles)',
      safeLimit: '12 µg/m³ (Annual)',
      sourceDesc: 'Vehicle emissions, biomass combustion, industrial discharge.',
      healthImpact: 'Penetrates deep into pulmonary alveoli and enters bloodstream.',
    },
    {
      key: 'pm10',
      name: 'PM10 (Coarse Inhalable)',
      safeLimit: '54 µg/m³ (24-Hour)',
      sourceDesc: 'Road dust, construction sites, industrial particulate handling.',
      healthImpact: 'Irritates nasal passages, trachea, and upper airways.',
    },
    {
      key: 'no2',
      name: 'Nitrogen Dioxide (NO2)',
      safeLimit: '53 ppb (1-Hour)',
      sourceDesc: 'Internal combustion engines, thermal power plants.',
      healthImpact: 'Airway inflammation and heightened responsiveness in asthmatics.',
    },
    {
      key: 'o3',
      name: 'Ground-level Ozone (O3)',
      safeLimit: '70 ppb (8-Hour)',
      sourceDesc: 'Formed photochemically from NOx + VOCs under sunlight.',
      healthImpact: 'Reduces lung capacity, triggers chest tightness and coughing.',
    },
    {
      key: 'co',
      name: 'Carbon Monoxide (CO)',
      safeLimit: '9 ppm (8-Hour)',
      sourceDesc: 'Incomplete combustion of fuels and vehicular exhaust.',
      healthImpact: 'Reduces oxygen delivery to heart, brain, and bodily tissues.',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Air Quality Breakdown</Text>
          <Text style={styles.subtitle}>Detailed chemical & particulate composition analysis</Text>
        </View>

        {loading || !aqiData ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.cardList}>
            {standards.map((std) => {
              const current = aqiData.pollutants[std.key];
              const conc = current?.concentration;

              return (
                <View key={std.key} style={styles.pollutantDetailCard}>
                  <View style={styles.cardTop}>
                    <View>
                      <Text style={styles.pollutantName}>{std.name}</Text>
                      <Text style={styles.safeLimitText}>Safe Limit: {std.safeLimit}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: (current?.status_color || COLORS.textMuted) + '20' }]}>
                      <Text style={[styles.badgeText, { color: current?.status_color || COLORS.textMuted }]}>
                        {current?.status || 'Unavailable'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.readingRow}>
                    <Text style={styles.readingValue}>{conc !== null && conc !== undefined ? conc : 'N/A'}</Text>
                    <Text style={styles.readingUnit}>{current?.unit || 'µg/m³'}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.infoRow}>
                    <Feather name="alert-circle" size={13} color={COLORS.textMuted} />
                    <Text style={styles.infoText}><Text style={{ fontWeight: '700' }}>Impact:</Text> {std.healthImpact}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Feather name="layers" size={13} color={COLORS.textMuted} />
                    <Text style={styles.infoText}><Text style={{ fontWeight: '700' }}>Sources:</Text> {std.sourceDesc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
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
    paddingBottom: 28,
  },
  header: {
    marginBottom: 20,
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
  cardList: {
    gap: 14,
  },
  pollutantDetailCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pollutantName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  safeLimitText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  readingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  readingValue: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  readingUnit: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    flex: 1,
  },
});

