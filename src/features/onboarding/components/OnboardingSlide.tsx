import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { OnboardingIllustration } from './OnboardingIllustration';
import { OnboardingContent } from './OnboardingContent';
import type { OnboardingSlideData } from '../data';

type OnboardingSlideProps = {
  slide: OnboardingSlideData;
  width: number;
};

export function OnboardingSlide({ slide, width }: OnboardingSlideProps) {
  const { height } = useWindowDimensions();
  const illustrationHeight = Math.round(
    height < 700
      ? Math.max(height * 0.34, 160)
      : Math.min(Math.max(height * 0.44, 200), height * 0.5),
  );

  return (
    <View style={[styles.slide, { width }]}>
      <OnboardingIllustration
        source={slide.image}
        label={slide.imageLabel}
        height={illustrationHeight}
      />
      <View style={styles.copy}>
        <OnboardingContent title={slide.title} description={slide.description} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    paddingHorizontal: 24,
  },
  copy: {
    marginTop: 8,
    flexShrink: 1,
  },
});
