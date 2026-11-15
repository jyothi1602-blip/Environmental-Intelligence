import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { WeatherData } from '../types';

interface Props {
  weather: WeatherData;
}

export const WeatherCard: React.FC<Props> = ({ weather }) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Feather name="cloud" size={18} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Weather Conditions</Text>
        </View>
        <Text style={styles.sourceText}>{weather.source}</Text>
      </View>

      <View style={styles.mainRow}>
        <View>
          <Text style={styles.tempText}>{Math.round(weather.temperature)}°C</Text>
          <Text style={styles.conditionText}>{weather.weather_condition}</Text>
          <Text style={styles.feelsLikeText}>Feels like {Math.round(weather.feels_like)}°C</Text>
        </View>

        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="weather-partly-cloudy" size={44} color={COLORS.accent} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Feather name="droplet" size={14} color={COLORS.info} />
          <Text style={styles.statLabel}>Humidity</Text>
          <Text style={styles.statValue}>{weather.humidity}%</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Feather name="wind" size={14} color={COLORS.accent} />
          <Text style={styles.statLabel}>Wind Speed</Text>
          <Text style={styles.statValue}>{weather.wind_speed} m/s</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Feather name="sun" size={14} color={COLORS.warning} />
          <Text style={styles.statLabel}>Visibility</Text>
          <Text style={styles.statValue}>Moderate</Text>
        </View>
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
    marginBottom: 14,
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
  sourceText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tempText: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  conditionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginTop: 2,
  },
  feelsLikeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
});

