import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { CopilotAction } from '../../../lib/copilot/types';
import { copilotBrand } from '../copilotBrand';
import { spacing } from '../../../theme';

const ACTION_ICONS: Record<string, string> = {
  book_doctor: 'doctor',
  order_medicine: 'pill',
  book_lab: 'test-tube',
  emergency_alert: 'phone-alert',
  call_emergency: 'phone-alert',
  find_emergency_room: 'hospital-building',
  health_plan: 'clipboard-pulse',
  symptom_tracker: 'chart-timeline-variant',
  pharmacy: 'pharmacy',
  follow_up: 'calendar-clock',
  follow_up_reminder: 'calendar-clock',
  family_notification: 'account-group',
  schedule_reminder: 'bell-ring',
  compare_prices: 'tag-multiple',
  auto_refill: 'refresh',
};

type CopilotActionCardProps = {
  action: CopilotAction;
  onPress: (action: CopilotAction) => void;
  isPrimary?: boolean;
};

export function CopilotActionCard({
  action,
  onPress,
  isPrimary,
}: CopilotActionCardProps) {
  const icon = ACTION_ICONS[action.type] ?? 'arrow-right-circle';
  const isEmergency =
    action.type === 'emergency_alert' || action.type === 'call_emergency';

  return (
    <Pressable
      style={[
        styles.card,
        isPrimary && styles.cardPrimary,
        isEmergency && styles.cardEmergency,
      ]}
      onPress={() => onPress(action)}>
      <View style={styles.row}>
        <View
          style={[
            styles.iconWrap,
            isPrimary && styles.iconWrapPrimary,
            isEmergency && styles.iconWrapEmergency,
          ]}>
          <Icon
            name={icon}
            size={20}
            color={
              isPrimary || isEmergency
                ? copilotBrand.onAccent
                : copilotBrand.accent
            }
          />
        </View>
        <View style={styles.content}>
          <Text
            style={[
              styles.label,
              (isPrimary || isEmergency) && styles.labelLight,
            ]}>
            {action.label}
          </Text>
          <Text
            style={[
              styles.reason,
              (isPrimary || isEmergency) && styles.reasonLight,
            ]}>
            {action.reason}
          </Text>
        </View>
        <Icon
          name="chevron-right"
          size={20}
          color={
            isPrimary || isEmergency
              ? copilotBrand.onAccent
              : copilotBrand.mist
          }
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: copilotBrand.page,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: copilotBrand.border,
    padding: spacing.md,
  },
  cardPrimary: {
    backgroundColor: copilotBrand.accent,
    borderColor: copilotBrand.accent,
  },
  cardEmergency: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: copilotBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapPrimary: { backgroundColor: 'rgba(255,255,255,0.2)' },
  iconWrapEmergency: { backgroundColor: 'rgba(255,255,255,0.2)' },
  content: { flex: 1, gap: 2, minWidth: 0 },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: copilotBrand.ink,
  },
  labelLight: { color: copilotBrand.onAccent },
  reason: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: copilotBrand.muted,
  },
  reasonLight: { color: 'rgba(255,255,255,0.85)' },
});
