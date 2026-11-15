import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

interface Props {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onGetStarted, onLogin }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Environmental Branding */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="leaf" size={38} color={COLORS.textWhite} />
          </View>
          <Text style={styles.appName}>AURA</Text>
          <Text style={styles.tagline}>Environmental Intelligence</Text>
          <View style={styles.pillBadge}>
            <Text style={styles.pillText}>AI-Powered AQI & Smart Mobility</Text>
          </View>
        </View>

        {/* Hero Card / Illustration Replacement */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.indicatorDot} />
            <Text style={styles.heroSub}>Milestone 1 Preview • Week 1–2</Text>
          </View>
          <Text style={styles.heroTitle}>Breathe Intelligently, Move Safely.</Text>
          <Text style={styles.heroDesc}>
            Real-time multi-sensor air quality telemetry, personalized health advisories, and clean route mobility tailored specifically to you.
          </Text>

          {/* Quick Feature Pillars */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
                <Feather name="activity" size={20} color={COLORS.accent} />
              </View>
              <Text style={styles.featureTitle}>Live Multi-Feed AQI</Text>
              <Text style={styles.featureDetail}>OpenAQ, WAQI & CPCB</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Feather name="shield" size={20} color={COLORS.warning} />
              </View>
              <Text style={styles.featureTitle}>Health Sensitivity</Text>
              <Text style={styles.featureDetail}>Asthma & Allergen Care</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Feather name="navigation" size={20} color={COLORS.info} />
              </View>
              <Text style={styles.featureTitle}>Smart Mobility</Text>
              <Text style={styles.featureDetail}>Pollution-Aware Travel</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={onGetStarted} activeOpacity={0.88}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <Feather name="arrow-right" size={20} color={COLORS.textWhite} style={styles.btnIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onLogin} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>
              Already have an account? <Text style={styles.loginHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Trust & Privacy Notice */}
        <View style={styles.privacyFooter}>
          <Feather name="lock" size={13} color={COLORS.textMuted} />
          <Text style={styles.privacyText}>
            Privacy-first design: Health data is optional & processed with explicit consent.
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
    paddingHorizontal: 24,
    paddingVertical: 28,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 16,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pillBadge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  heroCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    padding: 22,
    marginVertical: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginRight: 8,
  },
  heroSub: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 28,
    marginBottom: 10,
  },
  heroDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  featureDetail: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  actionContainer: {
    width: '100%',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
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
  btnIcon: {
    marginLeft: 8,
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginHighlight: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  privacyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  privacyText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

