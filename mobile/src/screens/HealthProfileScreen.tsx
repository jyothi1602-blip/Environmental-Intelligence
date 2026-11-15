import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, ScrollView,
  SafeAreaView, TextInput, Switch, ActivityIndicator, Alert
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { apiService } from '../services/apiService';
import { userStorage } from '../storage/userStorage';
import { HealthProfile } from '../types';

interface Props {
  userToken?: string;
  onContinue: () => void;
  onSkip: () => void;
  onBack: () => void;
}

const CONDITIONS_LIST = [
  { id: 'Asthma', label: 'Asthma', desc: 'Airway hyper-responsiveness to particulates' },
  { id: 'Respiratory sensitivity', label: 'Respiratory Sensitivity', desc: 'Frequent coughing or shortness of breath in smog' },
  { id: 'Allergies', label: 'Airborne Allergies', desc: 'Pollen, dust, and particulate sensitivities' },
  { id: 'Other respiratory conditions', label: 'Other Chronic Conditions', desc: 'COPD, bronchitis, or related concerns' },
  { id: 'No known sensitivity', label: 'No Known Sensitivity', desc: 'Standard baseline population exposure' },
];

const SENSITIVITY_GROUPS: Array<'General' | 'Children' | 'Elderly' | 'Sensitive individuals'> = [
  'General',
  'Children',
  'Elderly',
  'Sensitive individuals'
];

export const HealthProfileScreen: React.FC<Props> = ({ userToken, onContinue, onSkip, onBack }) => {
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<'General' | 'Children' | 'Elderly' | 'Sensitive individuals'>('General');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleCondition = (condId: string) => {
    if (condId === 'No known sensitivity') {
      setSelectedConditions(['No known sensitivity']);
      setSelectedGroup('General');
      return;
    }
    let updated = selectedConditions.filter(c => c !== 'No known sensitivity');
    if (updated.includes(condId)) {
      updated = updated.filter(c => c !== condId);
    } else {
      updated.push(condId);
      // Automatically adjust group if sensitive condition is selected
      if (selectedGroup === 'General') {
        setSelectedGroup('Sensitive individuals');
      }
    }
    setSelectedConditions(updated);
  };

  const handleSave = async () => {
    if (!consentGiven) {
      setErrorMsg('Explicit consent is required to save voluntary health preferences.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    const profile: HealthProfile = {
      conditions: selectedConditions.length > 0 ? selectedConditions : ['No known sensitivity'],
      sensitivityGroup: selectedGroup,
      additionalNotes: additionalNotes.trim() || undefined,
      consentGiven: true,
      updatedAt: new Date().toISOString()
    };

    try {
      await apiService.saveHealthProfile(profile, userToken);
      await userStorage.saveHealthProfile(profile);
      onContinue();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save health profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Navigation Row */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>Step 2 of 3: Health Sensitivity</Text>
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Health & Sensitivity Profile</Text>
          <Text style={styles.subtitle}>
            Personalize air quality advisories based on your respiratory vulnerability.
          </Text>
        </View>

        {/* Informative Explanation Banner */}
        <View style={styles.infoBanner}>
          <Feather name="info" size={18} color={COLORS.primary} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoBannerTitle}>Why does AURA ask this?</Text>
            <Text style={styles.infoBannerText}>
              Vulnerable groups (such as individuals with asthma or allergies) experience irritation at lower pollution levels than the general public.
              Your answers calibrate personal alerts and safe mobility recommendations.
            </Text>
          </View>
        </View>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={16} color={COLORS.danger} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Condition Checkboxes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Relevant Environmental Conditions</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply to you:</Text>

          <View style={styles.conditionList}>
            {CONDITIONS_LIST.map((item) => {
              const isChecked = selectedConditions.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.conditionCard, isChecked && styles.conditionCardChecked]}
                  onPress={() => toggleCondition(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                    {isChecked ? <Feather name="check" size={14} color={COLORS.textWhite} /> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.conditionName, isChecked && styles.conditionNameChecked]}>
                      {item.label}
                    </Text>
                    <Text style={styles.conditionDesc}>{item.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Sensitivity Group */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Applicable Sensitivity Demographic Group</Text>
          <View style={styles.groupChips}>
            {SENSITIVITY_GROUPS.map((grp) => {
              const selected = selectedGroup === grp;
              return (
                <TouchableOpacity
                  key={grp}
                  style={[styles.groupChip, selected && styles.groupChipSelected]}
                  onPress={() => setSelectedGroup(grp)}
                >
                  <Text style={[styles.groupChipText, selected && styles.groupChipTextSelected]}>
                    {grp}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Optional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Environmental Context (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="e.g. Sensitive to heavy vehicle diesel exhaust or morning cold air."
            placeholderTextColor={COLORS.textMuted}
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Consent & Privacy Notice */}
        <View style={styles.consentCard}>
          <View style={styles.consentRow}>
            <Switch
              value={consentGiven}
              onValueChange={setConsentGiven}
              trackColor={{ false: '#CBD5E1', true: COLORS.accent }}
            />
            <Text style={styles.consentText}>
              I give explicit consent for AURA to store and process this voluntary sensitivity profile to deliver personalized environmental warnings.
            </Text>
          </View>

          <View style={styles.disclaimerBox}>
            <MaterialCommunityIcons name="shield-check-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.disclaimerText}>
              Non-Medical Intelligence: This application provides air quality observations only. It does not provide clinical diagnosis or medical treatment advice. You may edit or delete your data anytime from Settings.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.continueButton, (!consentGiven || loading) && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={!consentGiven || loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textWhite} />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Save & Proceed to Location</Text>
                <Feather name="arrow-right" size={18} color={COLORS.textWhite} style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipSecondary} onPress={onSkip}>
            <Text style={styles.skipSecondaryText}>Skip for now (use default general profile)</Text>
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
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  titleSection: {
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
    lineHeight: 19,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.accentLight,
    padding: 14,
    borderRadius: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#C6F6D5',
    gap: 12,
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  infoBannerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  conditionList: {
    gap: 10,
  },
  conditionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  conditionCardChecked: {
    borderColor: COLORS.accent,
    backgroundColor: '#F0FDF4',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground,
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  conditionName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  conditionNameChecked: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  conditionDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  groupChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  groupChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceVariant,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  groupChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  groupChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  groupChipTextSelected: {
    color: COLORS.textWhite,
  },
  notesInput: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    fontSize: 13,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
    minHeight: 70,
    marginTop: 6,
  },
  consentCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    gap: 12,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  consentText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 18,
    fontWeight: '500',
  },
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceVariant,
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  buttonContainer: {
    gap: 8,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: COLORS.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
  skipSecondary: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipSecondaryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});

