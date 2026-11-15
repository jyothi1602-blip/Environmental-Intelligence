import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, ScrollView,
  SafeAreaView, TextInput, ActivityIndicator, Alert
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '../theme/colors';
import { apiService } from '../services/apiService';
import { userStorage } from '../storage/userStorage';
import { LocationConsent } from '../types';

interface Props {
  userToken?: string;
  initialCity?: string;
  onContinue: () => void;
  onBack: () => void;
}

export const LocationScreen: React.FC<Props> = ({ userToken, initialCity = 'Delhi', onContinue, onBack }) => {
  const [gpsGranted, setGpsGranted] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [manualCity, setManualCity] = useState(initialCity);
  const [isManual, setIsManual] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleRequestGps = async () => {
    setRequesting(true);
    setStatusMsg('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setStatusMsg('GPS permission was denied. You can specify your city manually below.');
        setIsManual(true);
        setGpsGranted(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setGpsGranted(true);
      setStatusMsg(`GPS acquired: ${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);

      // Reverse geocode to find city
      try {
        const rev = await Location.reverseGeocodeAsync(loc.coords);
        if (rev && rev.length > 0 && rev[0].city) {
          setManualCity(rev[0].city);
        }
      } catch (e) {
        // Fallback keep existing city name
      }
    } catch (err: any) {
      setStatusMsg('Unable to retrieve device GPS. You may enter your city manually.');
      setIsManual(true);
      setGpsGranted(false);
    } finally {
      setRequesting(false);
    }
  };

  const handleSaveAndProceed = async () => {
    setSaving(true);
    const locationData: LocationConsent = {
      gpsAllowed: gpsGranted,
      latitude: coords?.latitude || 28.6139,
      longitude: coords?.longitude || 77.2090,
      city: manualCity.trim() || 'Delhi',
      consentGiven: true,
      updatedAt: new Date().toISOString()
    };

    try {
      await apiService.saveLocationConsent(locationData, userToken);
      await userStorage.saveLocationConsent(locationData);
      onContinue();
    } catch (err: any) {
      console.warn('Failed to sync location to backend:', err);
      await userStorage.saveLocationConsent(locationData);
      onContinue();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>Step 3 of 3: Location Access</Text>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Enable Localized Intelligence</Text>
          <Text style={styles.subtitle}>
            AURA matches your coordinates with nearby monitoring stations and pollution models.
          </Text>
        </View>

        {/* Reasons Grid */}
        <View style={styles.reasonsContainer}>
          <Text style={styles.reasonsHeader}>Why does AURA require location?</Text>
          
          <View style={styles.reasonRow}>
            <View style={[styles.reasonIcon, { backgroundColor: '#E8F5E9' }]}>
              <Feather name="wind" size={18} color={COLORS.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reasonTitle}>Hyperlocal AQI Telemetry</Text>
              <Text style={styles.reasonDesc}>Retrieves air quality readings from stations within 5–25 km radius.</Text>
            </View>
          </View>

          <View style={styles.reasonRow}>
            <View style={[styles.reasonIcon, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="alert-triangle" size={18} color={COLORS.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reasonTitle}>Pollution Hotspot Warnings</Text>
              <Text style={styles.reasonDesc}>Identifies sudden particulate spikes along major regional corridors.</Text>
            </View>
          </View>

          <View style={styles.reasonRow}>
            <View style={[styles.reasonIcon, { backgroundColor: '#EFF6FF' }]}>
              <Feather name="navigation" size={18} color={COLORS.info} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reasonTitle}>Smart Mobility Recommendations</Text>
              <Text style={styles.reasonDesc}>Calculates clean travel corridors and lower-exposure transit paths.</Text>
            </View>
          </View>
        </View>

        {/* Status Message */}
        {statusMsg ? (
          <View style={[styles.statusBanner, gpsGranted ? styles.statusSuccess : styles.statusWarning]}>
            <Feather name={gpsGranted ? 'check-circle' : 'info'} size={16} color={gpsGranted ? COLORS.success : COLORS.warning} />
            <Text style={styles.statusText}>{statusMsg}</Text>
          </View>
        ) : null}

        {/* GPS Action Box */}
        <View style={styles.gpsBox}>
          <View style={styles.gpsHeader}>
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color={COLORS.primary} />
            <Text style={styles.gpsTitle}>Device GPS Integration</Text>
          </View>

          <TouchableOpacity
            style={[styles.gpsButton, gpsGranted && styles.gpsButtonGranted]}
            onPress={handleRequestGps}
            disabled={requesting}
            activeOpacity={0.85}
          >
            {requesting ? (
              <ActivityIndicator color={COLORS.textWhite} />
            ) : gpsGranted ? (
              <>
                <Feather name="check" size={18} color={COLORS.textWhite} style={{ marginRight: 6 }} />
                <Text style={styles.gpsButtonText}>Device GPS Connected</Text>
              </>
            ) : (
              <>
                <Feather name="map-pin" size={18} color={COLORS.textWhite} style={{ marginRight: 6 }} />
                <Text style={styles.gpsButtonText}>Allow Device Location Access</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Manual Fallback */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR SET MANUALLY</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.manualInputGroup}>
            <Text style={styles.manualLabel}>Selected City or Municipal Center</Text>
            <View style={styles.manualInputWrapper}>
              <Feather name="map" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.manualInput}
                placeholder="Enter city (e.g. Delhi, Hyderabad, London)"
                placeholderTextColor={COLORS.textMuted}
                value={manualCity}
                onChangeText={setManualCity}
              />
            </View>
          </View>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyCard}>
          <Feather name="shield" size={16} color={COLORS.textMuted} />
          <Text style={styles.privacyText}>
            Privacy Assurance: Coordinates are used exclusively to query atmospheric observations. Your continuous background movement is never tracked or logged.
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleSaveAndProceed}
          disabled={saving}
          activeOpacity={0.88}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.textWhite} />
          ) : (
            <>
              <Text style={styles.continueButtonText}>Finish Setup & Open Dashboard</Text>
              <Feather name="check-circle" size={18} color={COLORS.textWhite} style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  titleSection: {
    marginBottom: 18,
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
    lineHeight: 19,
  },
  reasonsContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    gap: 12,
  },
  reasonsHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  reasonRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  reasonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  reasonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  reasonDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginTop: 1,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    gap: 8,
  },
  statusSuccess: {
    backgroundColor: '#DCFCE7',
  },
  statusWarning: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  gpsBox: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  gpsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  gpsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  gpsButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsButtonGranted: {
    backgroundColor: COLORS.accent,
  },
  gpsButtonText: {
    color: COLORS.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginHorizontal: 10,
    letterSpacing: 0.5,
  },
  manualInputGroup: {
    gap: 6,
  },
  manualLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  manualInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  manualInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  privacyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceVariant,
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  privacyText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  continueButtonText: {
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
});

