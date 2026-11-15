import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, StatusBar, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { HealthProfileScreen } from './src/screens/HealthProfileScreen';
import { LocationScreen } from './src/screens/LocationScreen';
import { CompletionScreen } from './src/screens/CompletionScreen';
import { MainApp } from './src/screens/MainApp';
import { userStorage } from './src/storage/userStorage';
import { UserProfile } from './src/types';
import { COLORS } from './src/theme/colors';

type AppStep =
  | 'loading'
  | 'welcome'
  | 'register'
  | 'login'
  | 'health_profile'
  | 'location_permission'
  | 'completion'
  | 'dashboard';

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('loading');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userToken, setUserToken] = useState<string>('');

  useEffect(() => {
    // Check if user has already completed onboarding
    (async () => {
      try {
        const savedUser = await userStorage.getUser();
        const savedHealth = await userStorage.getHealthProfile();
        const savedLocation = await userStorage.getLocationConsent();

        if (savedUser && savedLocation) {
          setCurrentUser(savedUser);
          setUserToken(savedUser.token || 'saved_session_token');
          setCurrentStep('dashboard');
        } else {
          setCurrentStep('welcome');
        }
      } catch (e) {
        setCurrentStep('welcome');
      }
    })();
  }, []);

  const handleRegistered = async (user: UserProfile, token: string) => {
    setCurrentUser(user);
    setUserToken(token);
    await userStorage.saveUser(user);
    setCurrentStep('health_profile');
  };

  const handleLoginSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    setUserToken(user.token || 'session_token');
    await userStorage.saveUser(user);
    setCurrentStep('dashboard');
  };

  const handleHealthComplete = () => {
    setCurrentStep('location_permission');
  };

  const handleLocationComplete = () => {
    setCurrentStep('completion');
  };

  const handleEnterDashboard = () => {
    setCurrentStep('dashboard');
  };

  const handleLogout = async () => {
    await userStorage.clearAll();
    setCurrentUser(null);
    setUserToken('');
    setCurrentStep('welcome');
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'loading':
        return (
          <View style={styles.loadingScreen}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Initializing AURA Environmental Intelligence...</Text>
          </View>
        );

      case 'welcome':
        return (
          <WelcomeScreen
            onGetStarted={() => setCurrentStep('register')}
            onLogin={() => setCurrentStep('login')}
          />
        );

      case 'register':
        return (
          <RegisterScreen
            onRegistered={handleRegistered}
            onBack={() => setCurrentStep('welcome')}
            onGoToLogin={() => setCurrentStep('login')}
          />
        );

      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={() => setCurrentStep('register')}
            onBack={() => setCurrentStep('welcome')}
          />
        );

      case 'health_profile':
        return (
          <HealthProfileScreen
            userToken={userToken}
            onContinue={handleHealthComplete}
            onSkip={handleHealthComplete}
            onBack={() => setCurrentStep('register')}
          />
        );

      case 'location_permission':
        return (
          <LocationScreen
            userToken={userToken}
            initialCity={currentUser?.city || 'Delhi'}
            onContinue={handleLocationComplete}
            onBack={() => setCurrentStep('health_profile')}
          />
        );

      case 'completion':
        return (
          currentUser && (
            <CompletionScreen
              user={currentUser}
              onEnterDashboard={handleEnterDashboard}
            />
          )
        );

      case 'dashboard':
        return (
          currentUser && (
            <MainApp
              user={currentUser}
              onLogout={handleLogout}
            />
          )
        );

      default:
        return null;
    }
  };

  // On Web preview, frame the mobile app in an elegant smartphone mockup
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webWrapper}>
        <View style={styles.phoneFrame}>
          <View style={styles.phoneNotch}>
            <View style={styles.speaker} />
            <View style={styles.camera} />
          </View>
          <View style={styles.phoneScreen}>
            <StatusBar barStyle="dark-content" />
            {renderContent()}
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.nativeContainer}>
      <StatusBar barStyle="dark-content" />
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    gap: 14,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  // Web preview phone mockup container
  webWrapper: {
    flex: 1,
    backgroundColor: '#0B1F1C',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh' as any,
    padding: 16,
  },
  phoneFrame: {
    width: 410,
    height: 840,
    backgroundColor: '#1E293B',
    borderRadius: 44,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#334155',
  },
  phoneNotch: {
    height: 24,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  speaker: {
    width: 50,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
  },
  camera: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 34,
    overflow: 'hidden',
  },
});
