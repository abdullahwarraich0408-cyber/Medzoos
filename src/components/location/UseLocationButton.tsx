import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLocationContext } from '../../lib/location/LocationContext';
import type { DetectedLocation } from '../../lib/location/types';
import { colors, spacing, radius } from '../../theme';

type UseLocationButtonProps = {
  onLocationDetected?: (location: DetectedLocation) => void;
  /** @deprecated Prefer onLocationDetected for street + city */
  onCityDetected?: (city: string) => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export function UseLocationButton({
  onLocationDetected,
  onCityDetected,
  label = 'Use my exact location',
  style,
}: UseLocationButtonProps) {
  const { requestLocationDetection } = useLocationContext();
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      const result = await requestLocationDetection();
      if (result.declined) return;

      if (result.address) {
        onLocationDetected?.(result.address);
        onCityDetected?.(result.address.city);
        return;
      }

      if (!result.error) {
        Alert.alert(
          'Could not detect location',
          'Turn on GPS, allow location access, and try again. You can still enter your address manually.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.btn, style, loading && styles.btnDisabled]}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.85}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.brandPrimary} />
      ) : (
        <>
          <Icon name="crosshairs-gps" size={16} color={colors.brandPrimary} />
          <Text style={styles.text}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandLight,
  },
  btnDisabled: { opacity: 0.7 },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
});
