import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, shadows } from '../../../../theme';

export function HomeCollectionBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>🏠</Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>Free Home Sample Collection</Text>
        <Text style={styles.sub}>
          Certified phlebotomist visits your home. Select your lab and track
          collection in real time.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.brandBanner,
    borderRadius: radius.xxl,
    marginBottom: spacing.lg,
    ...shadows.cardElevated,
  },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 24 },
  text: { flex: 1 },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  sub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    lineHeight: 18,
  },
});
