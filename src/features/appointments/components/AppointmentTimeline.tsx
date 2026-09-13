import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  formatAppointmentStatusLabel,
  type TimelineStep,
} from '../../../lib/appointmentJourney';
import { colors, spacing, radius } from '../../../theme';

const STATE_COLORS = {
  completed: { bg: '#0F766E', border: '#0F766E', text: '#fff' },
  current: { bg: '#fff', border: '#0F766E', text: '#0F766E' },
  upcoming: { bg: '#fff', border: '#E2E8F0', text: '#94A3B8' },
  terminated: { bg: '#E11D48', border: '#E11D48', text: '#fff' },
} as const;

type Props = {
  steps?: TimelineStep[];
  status?: string;
};

export function AppointmentTimeline({ steps = [], status }: Props) {
  if (!steps.length) return null;
  const terminal = status === 'cancelled' || status === 'no_show';

  return (
    <View style={styles.wrap}>
      {terminal ? (
        <Text style={styles.terminal}>
          {formatAppointmentStatusLabel(status)} — this visit timeline has ended.
        </Text>
      ) : null}
      {steps.map((step, index) => {
        const palette = STATE_COLORS[step.state] || STATE_COLORS.upcoming;
        const isLast = index === steps.length - 1;
        return (
          <View key={step.id} style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: palette.bg,
                    borderColor: palette.border,
                  },
                ]}>
                <Text style={[styles.dotText, { color: palette.text }]}>
                  {step.state === 'completed' || step.state === 'terminated'
                    ? '✓'
                    : String(index + 1)}
                </Text>
              </View>
              {!isLast ? (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor:
                        step.state === 'completed'
                          ? '#14B8A6'
                          : step.state === 'terminated'
                            ? '#FB7185'
                            : '#E2E8F0',
                    },
                  ]}
                />
              ) : null}
            </View>
            <Text
              style={[
                styles.label,
                step.state === 'current' && styles.labelCurrent,
                step.state === 'completed' && styles.labelDone,
                step.state === 'terminated' && styles.labelTerminated,
                step.state === 'upcoming' && styles.labelUpcoming,
              ]}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 0 },
  terminal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BE123C',
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  rail: { alignItems: 'center', width: 24 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: { fontSize: 10, fontWeight: '700' },
  line: { width: 2, flex: 1, minHeight: 18 },
  label: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    paddingTop: 3,
    paddingBottom: spacing.md,
  },
  labelCurrent: { fontWeight: '700', color: '#115E59' },
  labelDone: { fontWeight: '600', color: colors.textPrimary },
  labelTerminated: { fontWeight: '700', color: '#BE123C' },
  labelUpcoming: { color: '#94A3B8' },
});
