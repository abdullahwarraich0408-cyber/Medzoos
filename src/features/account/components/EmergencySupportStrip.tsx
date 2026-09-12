import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '../../../theme';
import { youBrand } from '../youBrand';

type EmergencySupportStripProps = {
  onPress: () => void;
};

export function EmergencySupportStrip({ onPress }: EmergencySupportStripProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.strip, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Emergency support">
      <View style={styles.iconCircle}>
        <Icon name="lifebuoy" size={20} color={youBrand.danger} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.text}>Need urgent help?</Text>
        <Text style={styles.subtext}>Talk to Medzoos Copilot now</Text>
      </View>
      <View style={styles.btn}>
        <Text style={styles.btnText}>Get help</Text>
        <Icon name="arrow-right" size={14} color={youBrand.danger} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: youBrand.dangerSoft,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: youBrand.danger,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: { elevation: 1 },
    }),
  },
  pressed: { opacity: 0.92 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: youBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    color: youBrand.danger,
  },
  subtext: {
    fontSize: 12,
    fontWeight: '500',
    color: youBrand.muted,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: youBrand.card,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
    color: youBrand.danger,
  },
});
