import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { CopilotAction } from '../../../lib/copilot/types';
import { colors, spacing, radius } from '../../../theme';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';

const ACTION_ICONS: Record<string, string> = {
  book_doctor: 'doctor',
  order_medicine: 'pill',
  book_lab: 'test-tube',
  emergency_alert: 'phone-alert',
  health_plan: 'clipboard-pulse',
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

export function CopilotActionCard({ action, onPress, isPrimary }: CopilotActionCardProps) {
  const icon = ACTION_ICONS[action.type] ?? 'arrow-right-circle';
  const isEmergency = action.type === 'emergency_alert';

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
            size={22}
            color={isPrimary || isEmergency ? colors.white : colors.brandPrimary}
          />
        </View>
        <View style={styles.content}>
          <Text style={[styles.label, (isPrimary || isEmergency) && styles.labelLight]}>
            {action.label}
          </Text>
          <Text style={[styles.reason, (isPrimary || isEmergency) && styles.reasonLight]}>
            {action.reason}
          </Text>
        </View>
        <Icon
          name="chevron-right"
          size={20}
          color={isPrimary || isEmergency ? colors.white : colors.neutral400}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceBase,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
  },
  cardPrimary: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  cardEmergency: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: `${colors.brandPrimary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapPrimary: { backgroundColor: 'rgba(255,255,255,0.2)' },
  iconWrapEmergency: { backgroundColor: 'rgba(255,255,255,0.2)' },
  content: { flex: 1, gap: 2 },
  label: { ...healthOsTypography.messageTitle, fontSize: 15 },
  labelLight: { color: colors.white },
  reason: { ...healthOsTypography.messageBody, fontSize: 13, color: colors.neutral600 },
  reasonLight: { color: 'rgba(255,255,255,0.85)' },
});
