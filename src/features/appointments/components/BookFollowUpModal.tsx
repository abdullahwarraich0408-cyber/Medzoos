import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  useBookFollowUp,
  useFollowUpAvailableSlots,
} from '../../../lib/hooks/useApi';
import { colors, spacing, radius } from '../../../theme';

type FollowUpLike = {
  id: string;
  preferred_mode?: string;
  recommended_date?: string;
  doctor?: { name?: string };
};

type Props = {
  followUp: FollowUpLike | null;
  visible: boolean;
  onClose: () => void;
};

export function BookFollowUpModal({ followUp, visible, onClose }: Props) {
  const slotsQuery = useFollowUpAvailableSlots(followUp?.id, {
    enabled: Boolean(followUp?.id) && visible,
  });
  const bookMut = useBookFollowUp();
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [mode, setMode] = useState(
    followUp?.preferred_mode === 'in_clinic' ? 'in_clinic' : 'online',
  );

  const slotGroups = useMemo(() => {
    const data = slotsQuery.data || {};
    const groups: Array<{
      date?: string;
      label: string;
      slots: Array<{ slot_id: string; slot: string }>;
    }> = [];
    if ((data.recommended_date_slots || []).length) {
      groups.push({
        date: data.recommended_date,
        label: `Recommended · ${data.recommended_date}`,
        slots: data.recommended_date_slots || [],
      });
    }
    (data.nearby_dates || []).forEach(day => {
      groups.push({
        date: day.date,
        label: day.date,
        slots: day.slots || [],
      });
    });
    return groups;
  }, [slotsQuery.data]);

  const handleBook = async () => {
    if (!followUp?.id) return;
    if (!selectedSlotId) {
      Alert.alert('Select a slot', 'Please choose a follow-up time.');
      return;
    }
    try {
      await bookMut.mutateAsync({
        id: followUp.id,
        slot_id: selectedSlotId,
        mode,
        payment_method: mode === 'online' ? 'stripe' : 'pay_at_clinic',
      });
      Alert.alert('Follow-up booked', 'Your follow-up appointment is confirmed.');
      onClose();
    } catch (error) {
      Alert.alert(
        'Booking failed',
        error instanceof Error ? error.message : 'Could not book follow-up.',
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Book follow-up</Text>
              <Text style={styles.subtitle}>
                {followUp?.doctor?.name
                  ? `Dr. ${String(followUp.doctor.name).replace(/^Dr\.?\s*/i, '')}`
                  : 'Your doctor'}
                {followUp?.recommended_date
                  ? ` · around ${followUp.recommended_date}`
                  : ''}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Icon name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Consultation mode</Text>
            <View style={styles.modeRow}>
              {(['online', 'in_clinic'] as const).map(item => (
                <Pressable
                  key={item}
                  style={[styles.modeChip, mode === item && styles.modeChipActive]}
                  onPress={() => setMode(item)}>
                  <Text
                    style={[
                      styles.modeChipText,
                      mode === item && styles.modeChipTextActive,
                    ]}>
                    {item === 'online' ? 'Online' : 'In-clinic'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: spacing.md }]}>
              Available slots
            </Text>
            {slotsQuery.isLoading ? (
              <ActivityIndicator color={colors.brandPrimary} />
            ) : slotGroups.length === 0 ? (
              <Text style={styles.empty}>No slots available right now.</Text>
            ) : (
              slotGroups.map(group => (
                <View key={group.label} style={styles.group}>
                  <Text style={styles.groupLabel}>{group.label}</Text>
                  <View style={styles.slots}>
                    {group.slots.map(slot => {
                      const active = selectedSlotId === slot.slot_id;
                      return (
                        <Pressable
                          key={slot.slot_id}
                          style={[styles.slot, active && styles.slotActive]}
                          onPress={() => setSelectedSlotId(slot.slot_id)}>
                          <Text
                            style={[
                              styles.slotText,
                              active && styles.slotTextActive,
                            ]}>
                            {slot.slot}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <Pressable
            style={[styles.primaryBtn, bookMut.isPending && { opacity: 0.7 }]}
            disabled={bookMut.isPending}
            onPress={handleBook}>
            {bookMut.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryBtnText}>Confirm follow-up</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    maxHeight: '88%',
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  modeRow: { flexDirection: 'row', gap: spacing.sm },
  modeChip: {
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modeChipActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: '#ECFDF5',
  },
  modeChipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  modeChipTextActive: { color: colors.brandPrimary },
  empty: { fontSize: 13, color: colors.textMuted },
  group: { marginBottom: spacing.md, gap: spacing.sm },
  groupLabel: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  slot: {
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  slotActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandPrimary,
  },
  slotText: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  slotTextActive: { color: colors.white },
  primaryBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
