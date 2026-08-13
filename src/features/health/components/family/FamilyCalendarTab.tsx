import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { FamilyEventView } from '../../data/familyVaultModel';
import { formatVaultDate } from '../../lib/familyVaultConstants';
import { colors, spacing, radius, cardStyles } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type FamilyCalendarTabProps = {
  events: FamilyEventView[];
  onAddEvent?: () => void;
};

function getEventIcon(type: FamilyEventView['eventType']) {
  switch (type) {
    case 'appointment':
      return 'stethoscope';
    case 'medicine_reminder':
      return 'pill';
    case 'lab_test':
      return 'flask-outline';
    case 'vaccination':
      return 'needle';
    case 'follow_up':
      return 'calendar-clock';
    default:
      return 'calendar-outline';
  }
}

export function FamilyCalendarTab({ events, onAddEvent }: FamilyCalendarTabProps) {
  if (events.length === 0) {
    return (
      <View style={styles.empty}>
        <Icon name="calendar-blank-outline" size={40} color={colors.neutral300} />
        <Text style={styles.emptyTitle}>No upcoming events</Text>
        <Text style={styles.emptySub}>
          Add appointment, refill, or lab test reminders.
        </Text>
        {onAddEvent ? (
          <Pressable style={styles.primaryBtn} onPress={onAddEvent}>
            <Text style={styles.primaryBtnText}>Add event</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  const grouped = events.reduce<Record<string, FamilyEventView[]>>((acc, evt) => {
    const key = evt.dayLabel;
    if (!acc[key]) acc[key] = [];
    acc[key].push(evt);
    return acc;
  }, {});

  return (
    <View style={styles.wrap}>
      {Object.entries(grouped).map(([day, dayEvents]) => (
        <View key={day} style={styles.dayGroup}>
          <Text style={styles.dayLabel}>{day}</Text>
          {dayEvents.map(evt => (
            <View key={evt.eventId} style={styles.eventRow}>
              <View style={styles.iconWrap}>
                <Icon
                  name={getEventIcon(evt.eventType)}
                  size={18}
                  color={colors.brandPrimary}
                />
              </View>
              <View style={styles.eventCopy}>
                <Text style={styles.eventTitle}>{evt.title}</Text>
                <Text style={styles.eventMeta}>
                  {evt.memberName}
                  {evt.description ? ` · ${evt.description}` : ''}
                </Text>
              </View>
              <Text style={styles.eventTime}>
                {evt.time || formatVaultDate(evt.date)}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  dayGroup: { gap: spacing.sm },
  dayLabel: {
    ...healthOsTypography.sectionTitle,
    fontSize: 14,
  },
  eventRow: {
    ...cardStyles.premiumSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCopy: { flex: 1 },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink900,
  },
  eventMeta: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 2,
  },
  eventTime: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  empty: {
    ...cardStyles.premiumSoft,
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink900,
    marginTop: spacing.sm,
  },
  emptySub: {
    fontSize: 13,
    color: colors.neutral500,
    textAlign: 'center',
    lineHeight: 18,
  },
  primaryBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});
