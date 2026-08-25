import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import {
  mapOrderToAppointmentCard,
} from '../components/AppointmentCard';
import { useAllOrders } from '../../../lib/hooks/useApi';
import type { YouStackParamList } from '../../../navigation/types';
import { colors, spacing, radius, shadows } from '../../../theme';

type DetailRoute = RouteProp<YouStackParamList, 'AppointmentDetail'>;
type DetailNav = NativeStackNavigationProp<YouStackParamList, 'AppointmentDetail'>;

type TrackTask = {
  id: string;
  title: string;
  subtitle: string;
  done: boolean;
};

function TaskRow({
  task,
  onToggle,
}: {
  task: TrackTask;
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
  const { data: allOrders = [], isLoading } = useAllOrders();

  const order = useMemo(
    () =>
      allOrders.find(
        o =>
          o.type === 'doctor' &&
          (o.sourceId === appointmentId || o.id === appointmentId),
      ),
    [allOrders, appointmentId],
  );

  const detail = useMemo(() => {
    if (!order) return null;
    const card = mapOrderToAppointmentCard(order);
    return {
      ...card,
      isOnline: Boolean(order.isOnline),
      hospital: order.deliveryAddress || 'Clinic',
      fee: order.total,
      records: [] as { id: string; title: string; meta: string; icon: string }[],
    };
  }, [order]);

  const [tasks, setTasks] = useState<TrackTask[]>([]);
  const trackingKey = order?.id ?? '';

  useEffect(() => {
    if (!order) {
      setTasks([]);
      return;
    }
    setTasks(
      order.tracking.map((step, index) => ({
        id: `${order.id}-t${index}`,
        title: step.step,
        subtitle: step.time,
        done: step.done,
      })),
    );
  }, [trackingKey, order]);

  const doneCount = useMemo(
    () => tasks.filter(t => t.done).length,
    [tasks],
  );
  const progress = tasks.length ? doneCount / tasks.length : 0;

  if (isLoading && !detail) {
    return (
      <ScreenLayout
        headerMode="stack"
        title="Track visit"
        showSearch={false}
        showCart={false}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.brandPrimary} />
        </View>
      </ScreenLayout>
    );
  }

  if (!detail) {
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
      appointmentId: detail.sourceId,
      doctorName: detail.doctorName,
    });
  };

  const openVideo = () => {
    if (!detail.isOnline) {
      Alert.alert(
        'Clinic visit',
        `${detail.doctorName} is an in-clinic appointment at ${detail.hospital}.`,
      );
      return;
    }
    navigation.navigate('AppointmentVideo', {
      appointmentId: detail.sourceId,
      doctorName: detail.doctorName,
      doctorImage: detail.image,
      slot: detail.slot,
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
          <Image source={{ uri: detail.image }} style={styles.avatar} />
          <View style={styles.heroCopy}>
            <Text style={styles.name}>{detail.doctorName}</Text>
            <Text style={styles.specialty}>{detail.specialty}</Text>
            <Text style={styles.meta}>
              {detail.callType} · {detail.slot}
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
              name={detail.isOnline ? 'video' : 'hospital-building'}
              size={18}
              color={colors.white}
            />
            <Text style={styles.actionChipText}>
              {detail.isOnline ? 'Video call' : 'Clinic info'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Visit progress</Text>
            <Text style={styles.progressCount}>
              {doneCount}/{tasks.length} Done
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          {tasks.length === 0 ? (
            <Text style={styles.muted}>No tracking steps yet.</Text>
          ) : (
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
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your records</Text>
          <Text style={styles.muted}>
            No records attached yet.
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.md) },
        ]}>
        <Pressable style={styles.primaryBtn} onPress={openVideo}>
          <Text style={styles.primaryBtnText}>
            {detail.isOnline ? 'Join video call' : 'View clinic details'}
          </Text>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  muted: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  heroCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral100,
  },
  heroCopy: { flex: 1, justifyContent: 'center', gap: 4 },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  specialty: {
    fontSize: 13,
    color: colors.textMuted,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  actionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  actionChat: { backgroundColor: colors.brandPrimary },
  actionVideo: { backgroundColor: '#0F766E' },
  actionChipText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral100,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brandPrimary,
  },
  taskList: { gap: spacing.sm },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: { opacity: 0.85 },
  taskCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neutral300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckDone: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  taskCopy: { flex: 1 },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  taskSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral200,
  },
  primaryBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
