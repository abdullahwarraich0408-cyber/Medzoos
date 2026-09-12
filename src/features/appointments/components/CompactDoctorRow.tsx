import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { AppointmentCardModel } from './AppointmentCard';
import { specialtyVisual } from '../../home/data/homeData';
import { appointmentsBrand } from '../appointmentsBrand';
import { spacing, radius } from '../../../theme';

type CompactDoctorRowProps = {
  item: AppointmentCardModel;
  onPress: () => void;
  onCalendarPress: () => void;
  onChatPress: () => void;
};

export function CompactDoctorRow({
  item,
  onPress,
  onCalendarPress,
  onChatPress,
}: CompactDoctorRowProps) {
  const visual = specialtyVisual(item.specialty);
  const whenLabel = item.slot ? `Next · ${item.slot}` : 'Book again';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}>
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.doctorName}
        </Text>
        <View style={styles.specRow}>
          <Icon name={visual.icon} size={12} color={appointmentsBrand.accent} />
          <Text style={styles.spec} numberOfLines={1}>
            {item.specialty}
          </Text>
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {whenLabel}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={onCalendarPress} hitSlop={6}>
          <Icon name="calendar-month" size={16} color={appointmentsBrand.onAccent} />
        </Pressable>
        <Pressable
          style={[styles.actionBtn, styles.actionBtnSoft]}
          onPress={onChatPress}
          hitSlop={6}>
          <Icon name="message-outline" size={16} color={appointmentsBrand.accent} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: appointmentsBrand.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: appointmentsBrand.border,
    padding: spacing.md,
  },
  pressed: { backgroundColor: appointmentsBrand.soft },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: appointmentsBrand.soft,
  },
  info: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: appointmentsBrand.ink,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spec: {
    fontSize: 12,
    fontWeight: '600',
    color: appointmentsBrand.accentSoft,
  },
  meta: {
    fontSize: 12,
    color: appointmentsBrand.muted,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: appointmentsBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSoft: {
    backgroundColor: appointmentsBrand.soft,
  },
});
