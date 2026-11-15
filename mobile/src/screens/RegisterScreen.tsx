import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  ScrollView, SafeAreaView, Switch, ActivityIndicator, Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { apiService } from '../services/apiService';
import { UserProfile } from '../types';

interface Props {
  onRegistered: (user: UserProfile, token: string) => void;
  onBack: () => void;
  onGoToLogin: () => void;
}

const AGE_GROUPS = ['Child (0-12)', 'Teen (13-17)', 'Adult (18-64)', 'Senior (65+)'];
const GENDERS = ['Female', 'Male', 'Non-Binary', 'Prefer not to say'];

export const RegisterScreen: React.FC<Props> = ({ onRegistered, onBack, onGoToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ageGroup, setAgeGroup] = useState('Adult (18-64)');
  const [gender, setGender] = useState('Prefer not to say');
  const [city, setCity] = useState('Delhi');
  
  // Notification preferences
  const [highPollutionAlerts, setHighPollutionAlerts] = useState(true);
  const [dailyForecast, setDailyForecast] = useState(true);
  const [healthAdvisories, setHealthAdvisories] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validateForm = () => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Please enter your full name (minimum 2 characters).');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please provide a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return false;
    }
    if (!city.trim()) {
      setErrorMsg('Please enter your primary city or municipality.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await apiService.register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        age_group: ageGroup,
        gender,
        city: city.trim(),
      });
      onRegistered(result.user, result.token);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Navigation Bar */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>Step 1 of 3: Account Setup</Text>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>
            Begin monitoring personal environmental exposure with precision telemetry.
          </Text>
        </View>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={16} color={COLORS.danger} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Inputs */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputWrapper}>
              <Feather name="user" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Sarah Jenkins"
                placeholderTextColor={COLORS.textMuted}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="sarah.jenkins@example.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password (min 6 characters) *</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Age Group Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age Group (helps calculate respiratory sensitivity)</Text>
            <View style={styles.chipRow}>
              {AGE_GROUPS.map((group) => {
                const selected = ageGroup === group;
                return (
                  <TouchableOpacity
                    key={group}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => setAgeGroup(group)}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {group}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* City / Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Primary City / Municipality *</Text>
            <View style={styles.inputWrapper}>
              <Feather name="map-pin" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Delhi, London, Mumbai"
                placeholderTextColor={COLORS.textMuted}
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>

          {/* Notification Preferences */}
          <View style={styles.notificationBox}>
            <Text style={styles.notificationBoxTitle}>Notification Preferences</Text>
            
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>High Pollution Warnings</Text>
              <Switch
                value={highPollutionAlerts}
                onValueChange={setHighPollutionAlerts}
                trackColor={{ false: '#CBD5E1', true: COLORS.accent }}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Daily Air Quality Forecast</Text>
              <Switch
                value={dailyForecast}
                onValueChange={setDailyForecast}
                trackColor={{ false: '#CBD5E1', true: COLORS.accent }}
              />
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Personalized Health Advisories</Text>
              <Switch
                value={healthAdvisories}
                onValueChange={setHealthAdvisories}
                trackColor={{ false: '#CBD5E1', true: COLORS.accent }}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textWhite} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Continue to Health Profile</Text>
                <Feather name="arrow-right" size={18} color={COLORS.textWhite} style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginRedirect} onPress={onGoToLogin}>
            <Text style={styles.loginRedirectText}>
              Already registered? <Text style={styles.highlightText}>Log in here</Text>
            </Text>
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
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 20,
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
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceVariant,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: COLORS.textWhite,
  },
  notificationBox: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
    gap: 12,
  },
  notificationBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  loginRedirect: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  loginRedirectText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  highlightText: {
    color: COLORS.accent,
    fontWeight: '700',
  },
});

