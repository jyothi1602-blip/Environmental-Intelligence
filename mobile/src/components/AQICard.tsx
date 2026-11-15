import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { AQIData } from '../types';

interface Props {
  data: AQIData;
}

export const AQICard: React.FC<Props> = ({ data }) => {
  return (
    <View style={[styles.card, { borderLeftColor: data.color, borderLeftWidth: 6 }]}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View style={[styles.statusDot, { backgroundColor: data.color }]} />
          <Text style={[styles.categoryBadge, { color: data.color }]}>{data.category}</Text>
        </View>
        <Text style={styles.updatedText}>
          {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {/* Main AQI Value Row */}
      <View style={styles.valueRow}>
        <View>
          <Text style={styles.valueNumber}>{data.aqi}</Text>
          <Text style={styles.valueUnit}>US-EPA AQI Standard</Text>
        </View>

        <View style={[styles.gaugeContainer, { backgroundColor: data.color + '1A' }]}>
          <MaterialCommunityIcons name="weather-fog" size={36} color={data.color} />
          <Text style={[styles.gaugeSub, { color: data.color }]}>Main: {data.dominant_pollutant}</Text>
        </View>
      </View>

      {/* Scale Indicator Bar */}
      <View style={styles.scaleContainer}>
        <View style={[styles.scaleSegment, { backgroundColor: COLORS.aqiGood }]} />
        <View style={[styles.scaleSegment, { backgroundColor: COLORS.aqiModerate }]} />
        <View style={[styles.scaleSegment, { backgroundColor: COLORS.aqiSensitive }]} />
        <View style={[styles.scaleSegment, { backgroundColor: COLORS.aqiUnhealthy }]} />
        <View style={[styles.scaleSegment, { backgroundColor: COLORS.aqiVeryUnhealthy }]} />
        <View style={[styles.scaleSegment, { backgroundColor: COLORS.aqiHazardous }]} />
      </View>

      {/* Source Tag & Station */}
      <View style={styles.footerRow}>
        <View style={styles.stationBadge}>
          <Feather name="radio" size={12} color={COLORS.textMuted} />
          <Text style={styles.stationText} numberOfLines={1}>{data.station_name}</Text>
        </View>
        <Text style={styles.sourceTag}>{data.source}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryBadge: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  updatedText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  valueNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: COLORS.textPrimary,
    lineHeight: 58,
  },
  valueUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  gaugeContainer: {
    width: 82,
    height: 82,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeSub: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  scaleContainer: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
    gap: 2,
  },
  scaleSegment: {
    flex: 1,
    height: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 12,
  },
  stationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  stationText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sourceTag: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primaryLight,
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});

