import React from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

type OnboardingIllustrationProps = {
  source: ImageSourcePropType;
  label: string;
  height: number;
};

export function OnboardingIllustration({
  source,
  label,
  height,
}: OnboardingIllustrationProps) {
  return (
    <View style={[styles.wrap, { height }]}>
      <Image
        source={source}
        style={styles.image}
        resizeMode="contain"
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
