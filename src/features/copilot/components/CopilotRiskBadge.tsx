import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RiskLevel } from '../../../lib/copilot/types';
import { riskLevelColor, riskLevelLabel } from '../../../lib/copilot/engines/riskEngine';
import { colors, spacing, radius } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type CopilotRiskBadgeProps = {
  level: RiskLevel;
};

export function CopilotRiskBadge({ level }: CopilotRiskBadgeProps) {
  const color = riskLevelColor(level);
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: `${color}18` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{riskLevelLabel(level)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { ...healthOsTypography.label, fontSize: 12, fontWeight: '600' },
});
