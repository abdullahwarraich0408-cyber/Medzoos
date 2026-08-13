import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';
import { healthOsTypography } from '../theme/healthOs';

type SimpleSectionProps = {
  title: string;
  hint?: string;
};

/** Section header with optional one-line explanation */
export function SimpleSection({ title, hint }: SimpleSectionProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4, marginBottom: spacing.xs },
  title: healthOsTypography.sectionTitle,
  hint: healthOsTypography.sectionHint,
});
