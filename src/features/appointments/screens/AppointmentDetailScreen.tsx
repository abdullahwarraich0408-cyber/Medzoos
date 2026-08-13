import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import {
  getDemoAppointment,
  type DemoPreVisitTask,
} from '../data/demoAppointmentDetails';
import type { YouStackParamList } from '../../../navigation/types';
import { colors, spacing, radius, shadows } from '../../../theme';

type DetailRoute = RouteProp<YouStackParamList, 'AppointmentDetail'>;
type DetailNav = NativeStackNavigationProp<YouStackParamList, 'AppointmentDetail'>;

function TaskRow({
  task,
  onToggle,
}: {
  task: DemoPreVisitTask;
  onToggle: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.taskRow, pressed && styles.pressed]}
      onPress={onToggle}>
      <View style={[styles.taskCheck, task.done && styles.taskCheckDone]}>
        {task.done ? (
          <Icon name="check" size={14} color={colors.white} />
        ) : null}
      </View>
      <View style={styles.taskCopy}>
        <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>
          {task.title}
        </Text>
        <Text style={styles.taskSub}>{task.subtitle}</Text>
      </View>
    </Pressable>
  );
}

export function AppointmentDetailScreen() {
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const insets = useSafeAreaInsets();
  const { appointmentId } = route.params;

  const seed = getDemoAppointment(appointmentId);
  const [tasks, setTasks] = useState<DemoPreVisitTask[]>(seed?.tasks ?? []);

  const doneCount = useMemo(
    () => tasks.filter(t => t.done).length,
    [tasks],
  );
  const progress = tasks.length ? doneCount / tasks.length : 0;

  if (!seed) {
    return (
      <ScreenLayout
        headerMode="stack"
        title="Track visit"
        showSearch={false}
        showCart={false}>
        <View style={styles.centered}>
          <Text style={styles.muted}>Appointment not found</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.link}>Go back</Text>
          </Pressable>
        </View>
      </ScreenLayout>
    );
  }

  const openChat = () => {
    navigation.navigate('AppointmentChat', {
      appointmentId: seed.sourceId,
      doctorName: seed.doctorName,
    });
  };

  const openVideo = () => {
    if (!seed.isOnline) {
      Alert.alert(
        'Clinic visit',
        `${seed.doctorName} is an in-clinic appointment at ${seed.hospital}.`,
      );
      return;
    }
    navigation.navigate('AppointmentVideo', {
      appointmentId: seed.sourceId,
      doctorName: seed.doctorName,
      doctorImage: seed.image,
      slot: seed.slot,
    });
  };

  return (
    <ScreenLayout
      headerMode="stack"
      title="Track visit"
      showSearch={false}
      showCart={false}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, spacing.lg) + 110 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Image source={{ uri: seed.image }} style={styles.avatar} />
          <View style={styles.heroCopy}>
            <Text style={styles.name}>{seed.doctorName}</Text>
            <Text style={styles.specialty}>{seed.specialty}</Text>
            <Text style={styles.meta}>
              {seed.callType} · {seed.slot}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionChip, styles.actionChat]}
            onPress={openChat}>
            <Icon name="message-outline" size={18} color={colors.white} />
            <Text style={styles.actionChipText}>Chat</Text>
          </Pressable>
          <Pressable
            style={[styles.actionChip, styles.actionVideo]}
            onPress={openVideo}>
            <Icon
              name={seed.isOnline ? 'video' : 'hospital-building'}
              size={18}
              color={colors.white}
            />
            <Text style={styles.actionChipText}>
              {seed.isOnline ? 'Video call' : 'Clinic info'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Pre-visit tasks</Text>
            <Text style={styles.progressCount}>
              {doneCount}/{tasks.length} Done
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.taskList}>
            {tasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() =>
                  setTasks(prev =>
                    prev.map(t =>
                      t.id === task.id ? { ...t, done: !t.done } : t,
                    ),
                  )
                }
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your records</Text>
          {seed.records.length === 0 ? (
            <Text style={styles.muted}>
              No records attached yet. Complete tasks to add notes and files.
            </Text>
          ) : (
            seed.records.map(record => (
              <View key={record.id} style={styles.recordRow}>
                <View style={styles.recordIcon}>
                  <Icon name={record.icon} size={18} color={colors.iconPrimary} />
                </View>
                <View style={styles.recordCopy}>
                  <Text style={styles.recordTitle}>{record.title}</Text>
                  <Text style={styles.recordMeta}>{record.meta}</Text>
                </View>
                <Icon name="chevron-right" size={18} color={colors.textMuted} />
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Visit details</Text>
          <View style={styles.detailLine}>
            <Text style={styles.detailLabel}>Fee</Text>
            <Text style={styles.detailValue}>
              PKR {seed.fee.toLocaleString()}
            </Text>
          </View>
          <View style={styles.detailLine}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{seed.hospital}</Text>
          </View>
          <View style={styles.detailLine}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={styles.detailValue}>Confirmed</Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.md) },
        ]}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && styles.pressed,
          ]}
          onPress={seed.isOnline ? openVideo : openChat}>
          <Icon
            name={seed.isOnline ? 'video' : 'message-outline'}
            size={20}
            color={colors.white}
          />
          <Text style={styles.primaryBtnText}>
            {seed.isOnline ? 'Join video consultation' : 'Message doctor'}
          </Text>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  muted: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  link: { fontSize: 14, fontWeight: '700', color: colors.primary700 },
  pressed: { opacity: 0.92 },

  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },

  heroCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.cardSoft,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary100,
  },
  heroCopy: { flex: 1, gap: 4, justifyContent: 'center' },
  name: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  specialty: { fontSize: 13, fontWeight: '600', color: colors.primary700 },
  meta: { fontSize: 12, color: colors.textMuted },

  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
  },
  actionChat: { backgroundColor: colors.primary700 },
  actionVideo: { backgroundColor: '#0E304B' },
  actionChipText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.cardSoft,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary700,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary100,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary700,
  },
  taskList: { gap: spacing.sm },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  taskCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  taskCheckDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  taskCopy: { flex: 1, gap: 2 },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  taskSub: { fontSize: 12, color: colors.textMuted },

  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordCopy: { flex: 1, gap: 2 },
  recordTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  recordMeta: { fontSize: 12, color: colors.textMuted },

  detailLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailLabel: { fontSize: 13, color: colors.textMuted },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#0E304B',
    borderRadius: radius.pill,
    paddingVertical: 16,
  },
  primaryBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
