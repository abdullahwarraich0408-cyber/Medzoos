import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HealthScoreRing } from '../../../design-system';
import { colors, spacing, radius, shadows } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type TimePeriod = 'morning' | 'afternoon' | 'evening';

const THEMES: Record<
  TimePeriod,
  {
    bg: string;
    accent: string;
    accentSoft: string;
    glow: string;
    titleColor: string;
    nameColor: string;
    subtitleColor: string;
    icon: string;
    chipBg: string;
    message: string;
  }
> = {
  morning: {
    bg: '#FFF8F0',
    accent: '#EA580C',
    accentSoft: '#FED7AA',
    glow: 'rgba(251, 146, 60, 0.22)',
    titleColor: '#C2410C',
    nameColor: '#7C2D12',
    subtitleColor: '#9A3412',
    icon: 'white-balance-sunny',
    chipBg: 'rgba(255, 255, 255, 0.72)',
    message: 'A healthy morning sets the tone for your whole day.',
  },
  afternoon: {
    bg: '#E8F4FF',
    accent: '#113D63',
    accentSoft: '#C5D8F0',
    glow: 'rgba(17, 61, 99, 0.18)',
    titleColor: '#113D63',
    nameColor: '#0C2E4A',
    subtitleColor: '#3B82F6',
    icon: 'weather-partly-cloudy',
    chipBg: 'rgba(255, 255, 255, 0.75)',
    message: 'Book care, track meds, and stay on top of your health.',
  },
  evening: {
    bg: '#EEF2FF',
    accent: '#4F46E5',
    accentSoft: '#C7D2FE',
    glow: 'rgba(99, 102, 241, 0.2)',
    titleColor: '#4338CA',
    nameColor: '#312E81',
    subtitleColor: '#4C1D95',
    icon: 'weather-night',
    chipBg: 'rgba(255, 255, 255, 0.72)',
    message: 'Review your day and plan tomorrow’s wellness.',
  },
};

function getTimePeriod(): TimePeriod {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function getGreeting(period: TimePeriod): string {
  if (period === 'morning') return 'Good morning';
  if (period === 'afternoon') return 'Good afternoon';
  return 'Good evening';
}

function formatToday() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

type HomeGreetingCardProps = {
  firstName: string;
  healthScore: number;
  upcomingAppointments?: number;
  onPressScore?: () => void;
  onPressCopilot?: () => void;
};

export function HomeGreetingCard({
  firstName,
  healthScore,
  upcomingAppointments = 0,
  onPressScore,
  onPressCopilot,
}: HomeGreetingCardProps) {
  const period = useMemo(() => getTimePeriod(), []);
  const theme = THEMES[period];

  return (
    <View style={[styles.card, { backgroundColor: theme.bg }]}>
      <View style={[styles.glowLarge, { backgroundColor: theme.glow }]} />
      <View style={[styles.glowSmall, { backgroundColor: theme.glow }]} />

      <View style={styles.topRow}>
        <View style={[styles.dateChip, { backgroundColor: theme.chipBg }]}>
          <Icon name="calendar-today" size={14} color={theme.accent} />
          <Text style={[styles.dateText, { color: theme.subtitleColor }]}>
            {formatToday()}
          </Text>
        </View>
        <View style={[styles.periodBadge, { backgroundColor: theme.accentSoft }]}>
          <Icon name={theme.icon} size={16} color={theme.accent} />
        </View>
      </View>

      <View style={styles.mainRow}>
        <View style={styles.copy}>
          <Text style={[styles.greeting, { color: theme.titleColor }]}>
            {getGreeting(period)}
          </Text>
          <Text style={[styles.name, { color: theme.nameColor }]}>{firstName}</Text>
          <Text style={[styles.message, { color: theme.subtitleColor }]}>
            {theme.message}
          </Text>

          <View style={styles.statsRow}>
            {upcomingAppointments > 0 ? (
              <View style={[styles.statChip, { backgroundColor: theme.chipBg }]}>
                <Icon name="calendar-clock" size={14} color={theme.accent} />
                <Text style={[styles.statText, { color: theme.subtitleColor }]}>
                  {upcomingAppointments} appointment
                  {upcomingAppointments > 1 ? 's' : ''} today
                </Text>
              </View>
            ) : (
              <View style={[styles.statChip, { backgroundColor: theme.chipBg }]}>
                <Icon name="heart-pulse" size={14} color={theme.accent} />
                <Text style={[styles.statText, { color: theme.subtitleColor }]}>
                  Your health hub is ready
                </Text>
              </View>
            )}
          </View>
        </View>

        <Pressable
          style={[styles.scoreCard, { backgroundColor: theme.chipBg }]}
          onPress={onPressScore}
          disabled={!onPressScore}>
          <HealthScoreRing score={healthScore} size={72} label="Score" />
        </Pressable>
      </View>

      {onPressCopilot ? (
        <Pressable
          style={[styles.copilotRow, { borderColor: theme.accentSoft }]}
          onPress={onPressCopilot}>
          <View style={[styles.copilotIcon, { backgroundColor: theme.accentSoft }]}>
            <Icon name="robot-outline" size={18} color={theme.accent} />
          </View>
          <Text style={[styles.copilotText, { color: theme.subtitleColor }]}>
            Ask Copilot for your daily health briefing
          </Text>
          <Icon name="chevron-right" size={20} color={theme.accent} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    ...shadows.card,
  },
  glowLarge: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -50,
    right: -30,
  },
  glowSmall: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    bottom: -20,
    left: -10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  dateText: { fontSize: 12, fontWeight: '600' },
  periodBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  copy: { flex: 1, gap: 2 },
  greeting: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  message: {
    ...healthOsTypography.messageBody,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  statsRow: { marginTop: spacing.md },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  statText: { fontSize: 11, fontWeight: '600' },
  scoreCard: {
    borderRadius: radius.xl,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copilotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  copilotIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copilotText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
