import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { DashboardScreen } from './DashboardScreen';
import { AirQualityScreen } from './AirQualityScreen';
import { MapScreen } from './MapScreen';
import { HistoryScreen } from './HistoryScreen';
import { ProfileScreen } from './ProfileScreen';
import { UserProfile } from '../types';

interface Props {
  user: UserProfile;
  onLogout: () => void;
}

type TabKey = 'home' | 'air' | 'map' | 'history' | 'profile';

export const MainApp: React.FC<Props> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardScreen user={user} />;
      case 'air':
        return <AirQualityScreen />;
      case 'map':
        return <MapScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'profile':
        return <ProfileScreen user={user} onLogout={onLogout} />;
      default:
        return <DashboardScreen user={user} />;
    }
  };

  const navItems: Array<{ key: TabKey; label: string; icon: string; iconType: 'feather' | 'material' }> = [
    { key: 'home', label: 'Home', icon: 'home', iconType: 'feather' },
    { key: 'air', label: 'Air Quality', icon: 'weather-dust', iconType: 'material' },
    { key: 'map', label: 'Map', icon: 'map', iconType: 'feather' },
    { key: 'history', label: 'History', icon: 'bar-chart-2', iconType: 'feather' },
    { key: 'profile', label: 'Profile', icon: 'user', iconType: 'feather' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.screenContent}>
        {renderActiveScreen()}
      </View>

      {/* Modern Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {navItems.map((item) => {
          const isActive = activeTab === item.key;

          return (
            <TouchableOpacity
              key={item.key}
              style={styles.navButton}
              onPress={() => setActiveTab(item.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                {item.iconType === 'feather' ? (
                  <Feather
                    name={item.icon as any}
                    size={20}
                    color={isActive ? COLORS.primary : COLORS.textMuted}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={22}
                    color={isActive ? COLORS.primary : COLORS.textMuted}
                  />
                )}
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenContent: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  iconWrapperActive: {
    backgroundColor: COLORS.accentLight,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});

