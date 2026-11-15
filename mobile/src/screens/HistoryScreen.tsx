import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { apiService } from '../services/apiService';
import { userStorage } from '../storage/userStorage';
import { HistoricalDataPoint } from '../types';

export const HistoryScreen: React.FC = () => {
  const [dataPoints, setDataPoints] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'aqi' | 'pm25' | 'pm10'>('aqi');
  const [sourceName, setSourceName] = useState('SQLite Local Store / InfluxDB');

  useEffect(() => {
    (async () => {
      const loc = await userStorage.getLocationConsent();
      const points = await apiService.fetchHistorical(loc?.city || 'Delhi', 24);
      setDataPoints(points);
      setLoading(false);
    })();
  }, []);

  const getMetricValue = (pt: HistoricalDataPoint) => {
    if (selectedMetric === 'aqi') return pt.aqi;
    if (selectedMetric === 'pm25') return pt.pm25 || 0;
    if (selectedMetric === 'pm10') return pt.pm10 || 0;
    return pt.aqi;
  };

  const getBarColor = (val: number) => {
    if (selectedMetric === 'aqi') {
      if (val <= 50) return COLORS.aqiGood;
      if (val <= 100) return COLORS.aqiModerate;
      if (val <= 150) return COLORS.aqiSensitive;
      return COLORS.aqiUnhealthy;
    }
    return COLORS.primary;
  };

  const maxVal = Math.max(...dataPoints.map(getMetricValue), 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Historical Telemetry</Text>
          <Text style={styles.subtitle}>Time-series air quality observations and trends</Text>
        </View>

        {/* Source Badge */}
        <View style={styles.engineBadge}>
          <MaterialCommunityIcons name="database-clock-outline" size={16} color={COLORS.primary} />
          <Text style={styles.engineText}>Backend Storage: InfluxDB & SQLite Hybrid Engine</Text>
        </View>

        {/* Metric Selector Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, selectedMetric === 'aqi' && styles.tabSelected]}
            onPress={() => setSelectedMetric('aqi')}
          >
            <Text style={[styles.tabText, selectedMetric === 'aqi' && styles.tabTextSelected]}>AQI Trend</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedMetric === 'pm25' && styles.tabSelected]}
            onPress={() => setSelectedMetric('pm25')}
          >
            <Text style={[styles.tabText, selectedMetric === 'pm25' && styles.tabTextSelected]}>PM2.5 (Fine)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedMetric === 'pm10' && styles.tabSelected]}
            onPress={() => setSelectedMetric('pm10')}
          >
            <Text style={[styles.tabText, selectedMetric === 'pm10' && styles.tabTextSelected]}>PM10 (Dust)</Text>
          </TouchableOpacity>
        </View>

        {/* Chart View */}
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Past Observations</Text>
              <Text style={styles.chartUnit}>
                {selectedMetric === 'aqi' ? 'Index' : 'µg/m³'}
              </Text>
            </View>

            {/* Bar Visualizer */}
            <View style={styles.barContainer}>
              {dataPoints.map((pt, idx) => {
                const val = getMetricValue(pt);
                const heightPercent = Math.max(15, Math.min(100, (val / maxVal) * 100));
                const color = getBarColor(val);
                const label = pt.timestamp.includes('T') ? pt.timestamp.split('T')[1].substring(0, 5) : pt.timestamp;

                return (
                  <View key={idx} style={styles.barCol}>
                    <Text style={styles.barValueText}>{Math.round(val)}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height: `${heightPercent}%`, backgroundColor: color }]} />
                    </View>
                    <Text style={styles.barLabel}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Observations Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Analytical Summary</Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Peak Exposure Hour</Text>
              <Text style={styles.summaryItemValue}>08:00 AM (168 AQI)</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemLabel}>Clearest Window</Text>
              <Text style={styles.summaryItemValue}>05:00 PM (138 AQI)</Text>
            </View>
          </View>

          <Text style={styles.summaryAdvice}>
            Data indicates elevated particulate levels during early morning inversion layers. Shift intensive outdoor workouts toward late afternoon when dispersion increases.
          </Text>
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
    marginBottom: 12,
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
  engineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  engineText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabSelected: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextSelected: {
    color: COLORS.textWhite,
  },
  chartCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  chartUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 20,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValueText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  barTrack: {
    width: 22,
    height: 110,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 11,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 11,
  },
  barLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 8,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceVariant,
    padding: 14,
    borderRadius: 14,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryItemLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  summaryItemValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  summaryDivider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.border,
  },
  summaryAdvice: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

