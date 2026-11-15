import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { UserProfile } from '../types';

interface Props {
  user: UserProfile;
  onEnterDashboard: () => void;
}

export const CompletionScreen: React.FC<Props> = ({ user, onEnterDashboard }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Animated Celebration Icon */}
        <View style={styles.celebrationCircle}>
          <MaterialCommunityIcons name="check-decagram" size={64} color={COLORS.accent} />
        </View>

        <Text style={styles.title}>Personalized Setup Complete!</Text>
        <Text style={styles.greeting}>Welcome, {user.fullName} 🎉</Text>
        <Text style={styles.description}>
          Your environmental intelligence profile has been configured and saved securely on your device.
        </Text>

        {/* Profile Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Feather name="user" size={16} color={COLORS.primary} />
            <Text style={styles.summaryLabel}>Account</Text>
            <Text style={styles.summaryValue}>{user.fullName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Feather name="map-pin" size={16} color={COLORS.primary} />
            <Text style={styles.summaryLabel}>Active Region</Text>
            <Text style={styles.summaryValue}>{user.city}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Feather name="shield" size={16} color={COLORS.primary} />
            <Text style={styles.summaryLabel}>Sensitivity Profile</Text>
            <Text style={[styles.summaryValue, { color: COLORS.accent }]}>Calibrated & Active</Text>
          </View>

          <View style={styles.summaryRow}>
            <Feather name="bell" size={16} color={COLORS.primary} />
            <Text style={styles.summaryLabel}>Smart Alerts</Text>
            <Text style={styles.summaryValue}>Real-Time Enabled</Text>
          </View>
        </View>

        {/* Enter Dashboard Action */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onEnterDashboard}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryButtonText}>Open Live Air Quality Dashboard</Text>
          <Feather name="arrow-right" size={20} color={COLORS.textWhite} style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <Text style={styles.footnote}>
          You will automatically remain signed in when you launch AURA next time.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#C6F6D5',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 28,
    gap: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: 10,
    flex: 1,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  footnote: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 14,
    textAlign: 'center',
  },
});

