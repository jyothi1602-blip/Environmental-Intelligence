import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { TrafficData } from '../types';

interface Props {
  traffic: TrafficData;
}

export const TrafficCard: React.FC<Props> = ({ traffic }) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="car-multiple" size={18} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Traffic & Smart Mobility</Text>
        </View>
        <Text style={styles.sourceText}>{traffic.source}</Text>
      </View>

      {traffic.is_available ? (
        <View style={styles.contentActive}>
          <View style={styles.activeRow}>
            <View>
              <Text style={styles.levelText}>{traffic.congestion_level}</Text>
              <Text style={styles.subText}>Average delay reduction: {traffic.speed_reduction_pct}%</Text>
            </View>
            <View style={styles.indexCircle}>
              <Text style={styles.indexNum}>{traffic.congestion_index}</Text>
              <Text style={styles.indexLabel}>Index</Text>
            </View>
          </View>
          <Text style={styles.noteText}>{traffic.note}</Text>
        </View>
      ) : (
        <View style={styles.unavailableBox}>
          <View style={styles.unavailableIconBox}>
            <Feather name="info" size={20} color={COLORS.textMuted} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.unavailableTitle}>Live Traffic Provider Not Configured</Text>
            <Text style={styles.unavailableDesc}>{traffic.note}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sourceText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  contentActive: {
    gap: 10,
  },
  activeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  indexCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexNum: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  indexLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  unavailableBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceVariant,
    padding: 14,
    borderRadius: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  unavailableIconBox: {
    marginTop: 2,
  },
  unavailableTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  unavailableDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
});

