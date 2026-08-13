import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { healthOs, healthOsTypography } from '../theme/healthOs';

type HealthScoreRingProps = {
  score: number;
  maxScore?: number;
  size?: number;
  label?: string;
};

export function HealthScoreRing({
  score,
  maxScore = 100,
  size = 88,
  label = 'Health Score',
}: HealthScoreRingProps) {
  const pct = Math.min(Math.max(score / maxScore, 0), 1);
  const ringSize = size;
  const innerSize = ringSize - 12;

  return (
    <View style={[styles.wrapper, { width: ringSize, height: ringSize }]}>
      <View
        style={[
          styles.track,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderColor: healthOs.scoreRingTrack,
          },
        ]}
      />
      <View
        style={[
          styles.progress,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderColor: colors.brandPrimary,
            borderRightColor: pct > 0.25 ? colors.brandPrimary : healthOs.scoreRingTrack,
            borderBottomColor: pct > 0.5 ? colors.brandPrimary : healthOs.scoreRingTrack,
            borderLeftColor: pct > 0.75 ? colors.brandPrimary : healthOs.scoreRingTrack,
          },
        ]}
      />
      <View
        style={[
          styles.inner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}>
        <Text style={[healthOsTypography.metric, styles.score]}>{score}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    borderWidth: 6,
  },
  progress: {
    position: 'absolute',
    borderWidth: 6,
    transform: [{ rotate: '-45deg' }],
  },
  inner: {
    backgroundColor: colors.surfaceBase,
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontSize: 26,
    color: colors.ink900,
  },
  label: {
    ...healthOsTypography.metricLabel,
    color: colors.neutral500,
    marginTop: -2,
  },
});
