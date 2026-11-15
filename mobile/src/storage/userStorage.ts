import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, HealthProfile, LocationConsent } from '../types';

const KEY_USER = '@aura_user_profile';
const KEY_HEALTH = '@aura_health_profile';
const KEY_LOCATION = '@aura_location_consent';

export const userStorage = {
  async saveUser(user: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEY_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user to storage:', e);
    }
  },

  async getUser(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(KEY_USER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to get user from storage:', e);
      return null;
    }
  },

  async saveHealthProfile(health: HealthProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEY_HEALTH, JSON.stringify(health));
    } catch (e) {
      console.error('Failed to save health profile:', e);
    }
  },

  async getHealthProfile(): Promise<HealthProfile | null> {
    try {
      const data = await AsyncStorage.getItem(KEY_HEALTH);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to get health profile:', e);
      return null;
    }
  },

  async saveLocationConsent(location: LocationConsent): Promise<void> {
    try {
      await AsyncStorage.setItem(KEY_LOCATION, JSON.stringify(location));
    } catch (e) {
      console.error('Failed to save location consent:', e);
    }
  },

  async getLocationConsent(): Promise<LocationConsent | null> {
    try {
      const data = await AsyncStorage.getItem(KEY_LOCATION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to get location consent:', e);
      return null;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([KEY_USER, KEY_HEALTH, KEY_LOCATION]);
    } catch (e) {
      console.error('Failed to clear local storage:', e);
    }
  }
};

