import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { colors } from '../../../theme';

type OnboardingContentProps = {
  title: string;
  description: string;
};

export function OnboardingContent({ title, description }: OnboardingContentProps) {
  const { width, height } = useWindowDimensions();
  const compact = width < 360 || height < 700;
  const titleSize = compact ? 28 : 32;
  const bodySize = compact ? 15 : 16;

  return (
    <View style={styles.wrap}>
      <Text
        style={[styles.title, { fontSize: titleSize, lineHeight: titleSize + 6 }]}
        maxFontSizeMultiplier={1.25}>
        {title}
      </Text>
      <Text
        style={[styles.description, { fontSize: bodySize, lineHeight: bodySize + 9 }]}
        maxFontSizeMultiplier={1.25}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.inkHeadline,
    letterSpacing: -0.6,
    lineHeight: 38,
    textAlign: 'center',
  },
  description: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 25,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
