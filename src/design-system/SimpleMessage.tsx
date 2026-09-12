import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { healthOs, healthOsTypography } from '../theme/healthOs';

type SimpleMessageProps = {
  label?: string;
  title?: string;
  message: string;
  tone?: 'default' | 'info' | 'warning' | 'success';
  footer?: ReactNode;
};

const toneStyles = {
  default: { bg: healthOs.messageBg, border: healthOs.messageBorder },
  info: { bg: healthOs.copilotSurface, border: 'rgba(16, 85, 104, 0.18)' },
  warning: { bg: healthOs.emergencyBg, border: '#FECACA' },
  success: { bg: colors.statusSuccessBg, border: '#BBF7D0' },
};

/** Clear message block — one idea per card */
export function SimpleMessage({
  label,
  title,
  message,
  tone = 'default',
  footer,
}: SimpleMessageProps) {
  const toneStyle = toneStyles[tone];

  return (
    <View style={[styles.box, { backgroundColor: toneStyle.bg, borderColor: toneStyle.border }]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.message}>{message}</Text>
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  label: healthOsTypography.label,
  title: healthOsTypography.messageTitle,
  message: healthOsTypography.messageBody,
});
