import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../theme/colors';
import { PollutantDetail } from '../types';

interface Props {
  pollutants: Record<string, PollutantDetail>;
}

export const PollutantsGrid: React.FC<Props> = ({ pollutants }) => {
  const pollutantKeys = ['pm25', 'pm10', 'no2', 'o3', 'co'];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>Pollutant Monitoring</Text>
      <View style={styles.grid}>
        {pollutantKeys.map((key) => {
          const item = pollutants[key] || {
            name: key.toUpperCase(),
            symbol: key.toUpperCase(),
            concentration: null,
            unit: 'µg/m³',
            status: 'Unavailable',
            status_color: '#94A3B8',
            timestamp: ''
          };

          const isAvailable = item.concentration !== null && item.concentration !== undefined;

          return (
            <View key={key} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.symbol}>{item.symbol}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status_color + '20' }]}>
                  <Text style={[styles.statusBadgeText, { color: item.status_color }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.valueRow}>
                {isAvailable ? (
                  <Text style={styles.concentration}>{item.concentration}</Text>
                ) : (
                  <Text style={styles.unavailableText}>N/A</Text>
                )}
                <Text style={styles.unit}>{item.unit}</Text>
              </View>

              <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  symbol: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  concentration: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  unavailableText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  unit: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  nameText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});

