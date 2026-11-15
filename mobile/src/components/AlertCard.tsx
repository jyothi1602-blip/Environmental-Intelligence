import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { PersonalizedAlerts } from '../types';

interface Props {
  alertsData: PersonalizedAlerts;
}

export const AlertCard: React.FC<Props> = ({ alertsData }) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="shield-alert" size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Personalized Health Advisories</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{alertsData.total_alerts} Active</Text>
        </View>
      </View>

      <Text style={styles.profileBadge}>
        Calibrated for: <Text style={{ fontWeight: '700' }}>{alertsData.sensitivity_group}</Text>
        {alertsData.conditions_detected.length > 0 ? ` (${alertsData.conditions_detected.join(', ')})` : ''}
      </Text>

      {/* Alert Items */}
      <View style={styles.alertsList}>
        {alertsData.alerts.map((alert) => (
          <View
            key={alert.id}
            style={[styles.alertItem, { borderLeftColor: alert.severity_color, borderLeftWidth: 4 }]}
          >
            <View style={styles.alertTop}>
              <Text style={styles.alertItemTitle}>{alert.title}</Text>
              <View style={[styles.severityPill, { backgroundColor: alert.severity_color + '20' }]}>
                <Text style={[styles.severityPillText, { color: alert.severity_color }]}>
                  {alert.category}
                </Text>
              </View>
            </View>

            <Text style={styles.alertMessage}>{alert.message}</Text>
            
            <View style={styles.adviceRow}>
              <Feather name="check" size={14} color={COLORS.primary} />
              <Text style={styles.adviceText}>{alert.action_advice}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Mandatory Regulatory / Non-Medical Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <Feather name="info" size={13} color={COLORS.textMuted} />
        <Text style={styles.disclaimerText}>{alertsData.disclaimer}</Text>
      </View>
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
    marginBottom: 6,
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
  countBadge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  profileBadge: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  alertsList: {
    gap: 10,
    marginBottom: 14,
  },
  alertItem: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  alertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  severityPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  severityPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  alertMessage: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  adviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  adviceText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    flex: 1,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 10,
  },
  disclaimerText: {
    fontSize: 10,
    color: COLORS.textMuted,
    lineHeight: 14,
    flex: 1,
  },
});

