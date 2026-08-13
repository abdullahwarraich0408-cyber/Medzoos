import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';

type EmergencySupportStripProps = {
  onPress: () => void;
};

export function EmergencySupportStrip({ onPress }: EmergencySupportStripProps) {
  return (
    <View style={styles.strip}>
      <View style={styles.iconCircle}>
        <Icon name="lifebuoy" size={18} color={healthOs.emergencyRed} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.text}>Need urgent help?</Text>
        <Text style={styles.subtext}>Emergency support</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        onPress={onPress}>
        <Text style={styles.btnText}>Emergency support</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: healthOs.emergencyBg,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.18)',
    ...shadows.cardSoft,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.15)',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.statusDanger,
  },
  subtext: {
    fontSize: 11,
    color: colors.neutral600,
  },
  btn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.15)',
    ...shadows.cardSoft,
  },
  btnPressed: { opacity: 0.9 },
  btnText: {
    fontSize: 10,
    fontWeight: '700',
    color: healthOs.emergencyRed,
  },
});
