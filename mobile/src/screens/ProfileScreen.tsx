import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator, Modal
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { apiService } from '../services/apiService';
import { userStorage } from '../storage/userStorage';
import { UserProfile, HealthProfile, LocationConsent } from '../types';

interface Props {
  user: UserProfile;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<Props> = ({ user, onLogout }) => {
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [locationConsent, setLocationConsent] = useState<LocationConsent | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const [h, l] = await Promise.all([
        userStorage.getHealthProfile(),
        userStorage.getLocationConsent(),
      ]);
      setHealthProfile(h);
      setLocationConsent(l);
      setLoading(false);
    })();
  }, []);

  const handleDeleteHealthProfile = async () => {
    setActionLoading(true);
    try {
      await apiService.deleteHealthProfile(user.token);
      await userStorage.saveHealthProfile({
        conditions: ['No known sensitivity'],
        sensitivityGroup: 'General',
        consentGiven: false,
      });
      setHealthProfile(null);
      setMessage('Health sensitivity preferences successfully removed.');
    } catch (e: any) {
      setMessage('Failed to remove health profile.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setActionLoading(true);
    try {
      await apiService.deleteAccount(user.token);
      await userStorage.clearAll();
      onLogout();
    } catch (e: any) {
      await userStorage.clearAll();
      onLogout();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Account & Privacy</Text>
          <Text style={styles.subtitle}>Manage profile information and data consent settings</Text>
        </View>

        {message ? (
          <View style={styles.messageBanner}>
            <Feather name="check-circle" size={16} color={COLORS.success} />
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ) : null}

        {/* User Info Card */}
        <View style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>
                {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user.fullName}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.pillBadge}>
                  <Text style={styles.pillText}>{user.ageGroup}</Text>
                </View>
                <View style={[styles.pillBadge, { backgroundColor: COLORS.accentLight }]}>
                  <Text style={[styles.pillText, { color: COLORS.primary }]}>{user.city}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Health Sensitivity Settings */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="heart-pulse" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Health Sensitivity Profile</Text>
          </View>

          {healthProfile && healthProfile.consentGiven ? (
            <View style={styles.healthDetails}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Sensitivity Group</Text>
                <Text style={styles.rowValue}>{healthProfile.sensitivityGroup}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Recorded Conditions</Text>
                <Text style={styles.rowValue}>
                  {healthProfile.conditions.length > 0 ? healthProfile.conditions.join(', ') : 'None'}
                </Text>
              </View>

              {healthProfile.additionalNotes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>"{healthProfile.additionalNotes}"</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.deleteOutlineBtn}
                onPress={handleDeleteHealthProfile}
                disabled={actionLoading}
              >
                <Feather name="trash-2" size={14} color={COLORS.danger} />
                <Text style={styles.deleteOutlineText}>Delete Health Sensitivity Data</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No active health sensitivity data configured.</Text>
            </View>
          )}
        </View>

        {/* Location & Consent */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="map-pin" size={18} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Location Telemetry</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>GPS Authorization</Text>
            <Text style={[styles.rowValue, { color: locationConsent?.gpsAllowed ? COLORS.accent : COLORS.warning }]}>
              {locationConsent?.gpsAllowed ? 'Granted (Live Coordinates)' : 'Manual City Fallback'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Primary City</Text>
            <Text style={styles.rowValue}>{locationConsent?.city || user.city || 'Delhi'}</Text>
          </View>
        </View>

        {/* Technical Architecture Info (Milestone 1) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="cpu" size={18} color={COLORS.primary} />
            <Text style={styles.cardTitle}>System Architecture (Milestone 1)</Text>
          </View>

          <View style={styles.techList}>
            <View style={styles.techRow}>
              <Text style={styles.techKey}>Backend</Text>
              <Text style={styles.techVal}>Python 3.13 • FastAPI • Uvicorn</Text>
            </View>
            <View style={styles.techRow}>
              <Text style={styles.techKey}>Databases</Text>
              <Text style={styles.techVal}>SQLite (Users) • InfluxDB (Time-Series)</Text>
            </View>
            <View style={styles.techRow}>
              <Text style={styles.techKey}>Telemetry</Text>
              <Text style={styles.techVal}>WAQI • OpenAQ • OpenWeatherMap</Text>
            </View>
            <View style={styles.techRow}>
              <Text style={styles.techKey}>Mobile App</Text>
              <Text style={styles.techVal}>React Native • TypeScript • Expo</Text>
            </View>
          </View>
        </View>

        {/* Danger Actions: Logout & Erase Account */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.8}>
            <Feather name="log-out" size={16} color={COLORS.primary} />
            <Text style={styles.logoutText}>Sign Out of AURA</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.eraseButton} onPress={handleDeleteAccount} activeOpacity={0.8}>
            <Feather name="user-x" size={16} color={COLORS.danger} />
            <Text style={styles.eraseText}>Permanently Erase Account & All Data</Text>
          </TouchableOpacity>
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
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  messageText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textWhite,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  pillBadge: {
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  healthDetails: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  notesBox: {
    backgroundColor: COLORS.surfaceVariant,
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  notesText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
  deleteOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 6,
    marginTop: 6,
    backgroundColor: '#FEF2F2',
  },
  deleteOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
  },
  emptyState: {
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  techList: {
    gap: 8,
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  techKey: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  techVal: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  actionContainer: {
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.primary,
    height: 48,
    borderRadius: 14,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  eraseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    height: 48,
    borderRadius: 14,
    gap: 8,
  },
  eraseText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger,
  },
});

