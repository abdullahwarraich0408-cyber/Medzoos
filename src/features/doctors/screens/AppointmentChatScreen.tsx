import { colors, spacing, radius } from '../../../theme';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Image,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import { useAuth } from '../../../lib/auth/AuthContext';
import {
  getChatParticipantLabels,
  mapChatMessage,
  useAppointmentChat,
  useMarkChatReadOnOpen,
  useSendAppointmentMessage,
} from '../../../lib/hooks/useTelehealth';
import {
  getDemoAppointment,
  isDemoAppointmentId,
  type DemoChatMessage,
} from '../../appointments/data/demoAppointmentDetails';
import type { OrdersStackParamList, YouStackParamList } from '../../../navigation/types';

type ChatRoute = RouteProp<OrdersStackParamList, 'AppointmentChat'>;
type ChatNav = NativeStackNavigationProp<
  YouStackParamList & OrdersStackParamList,
  'AppointmentChat'
>;
type MappedMessage = {
  id: string;
  text: string;
  isMine: boolean;
  isSystem?: boolean;
  createdAt?: string;
  senderName?: string | null;
};

function formatDoctorTitle(name: string) {
  const trimmed = name.trim();
  if (/^dr\.?\s/i.test(trimmed)) return trimmed;
  return `Dr. ${trimmed}`;
}

function shortDoctorName(name: string) {
  const title = formatDoctorTitle(name);
  const parts = title.split(/\s+/);
  if (parts.length <= 2) return title;
  return `${parts[0]} ${parts[1].charAt(0)}`;
}

function formatTime(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function MessageBubble({ message }: { message: MappedMessage }) {
  if (message.isSystem) {
    return (
      <View style={styles.systemWrap}>
        <Text style={styles.systemText}>{message.text}</Text>
      </View>
    );
  }

  const time = formatTime(message.createdAt);

  return (
    <View
      style={[
        styles.bubbleBlock,
        message.isMine ? styles.bubbleBlockMine : styles.bubbleBlockOther,
      ]}>
      <View
        style={[
          styles.bubble,
          message.isMine ? styles.bubbleMine : styles.bubbleOther,
        ]}>
        {message.text ? (
          <Text
            style={[
              styles.messageText,
              message.isMine ? styles.messageTextMine : styles.messageTextOther,
            ]}>
            {message.text}
          </Text>
        ) : null}
      </View>
      {time ? <Text style={styles.timeOutside}>{time}</Text> : null}
    </View>
  );
}

function ChatIdentity({
  title,
  subtitle,
  avatarUrl,
}: {
  title: string;
  subtitle: string;
  avatarUrl?: string | null;
}) {
  return (
    <View style={styles.headerCenter}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
      ) : (
        <View style={[styles.headerAvatar, styles.headerAvatarFallback]}>
          <Icon name="account" size={20} color={colors.primary700} />
        </View>
      )}
      <View style={styles.headerCopy}>
        <Text style={styles.headerName} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.onlineRow}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
}

function HeaderActionButton({
  icon,
  onPress,
  accessibilityLabel,
}: {
  icon: string;
  onPress?: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.headerBtn, pressed && styles.headerBtnPressed]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}>
      <Icon name={icon} size={22} color={colors.primary700} />
    </Pressable>
  );
}

function DemoChatContent() {
  const route = useRoute<ChatRoute>();
  const navigation = useNavigation<ChatNav>();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<MappedMessage>>(null);
  const [draft, setDraft] = useState('');

  const demo = getDemoAppointment(route.params.appointmentId);
  const [messages, setMessages] = useState<MappedMessage[]>(() =>
    (demo?.messages || []).map((m: DemoChatMessage) => ({
      id: m.id,
      text: m.text,
      isMine: m.isMine,
      createdAt: m.createdAt,
    })),
  );

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const doctorTitle = shortDoctorName(
    route.params.doctorName || demo?.doctorName || 'Doctor',
  );

  const dateStamp = `Today, ${formatTime(new Date().toISOString())}`;

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages(prev => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        text,
        isMine: true,
        createdAt: new Date().toISOString(),
      },
    ]);
    setDraft('');
  };

  const openVideo = () => {
    if (!demo?.isOnline) return;
    navigation.navigate('AppointmentVideo', {
      appointmentId: demo.sourceId,
      doctorName: demo.doctorName,
      doctorImage: demo.image,
      slot: demo.slot,
    });
  };

  return (
    <ScreenLayout
      headerMode="stack"
      showSearch={false}
      showCart={false}
      headerCenter={
        <ChatIdentity
          title={doctorTitle}
          subtitle="Online"
          avatarUrl={demo?.image}
        />
      }
      headerRight={
        demo?.isOnline ? (
          <HeaderActionButton
            icon="video"
            onPress={openVideo}
            accessibilityLabel="Join video"
          />
        ) : undefined
      }>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        {demo?.isOnline ? (
          <TouchableOpacity style={styles.videoBtn} onPress={openVideo}>
            <Icon name="video" size={18} color={colors.white} />
            <Text style={styles.videoBtnText}>Join video consultation</Text>
          </TouchableOpacity>
        ) : null}

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.datePillWrap}>
              <View style={styles.datePill}>
                <Text style={styles.datePillText}>{dateStamp}</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => <MessageBubble message={item} />}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
        />

        <View
          style={[
            styles.inputBar,
            { paddingBottom: Math.max(insets.bottom, spacing.sm) },
          ]}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !draft.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!draft.trim()}>
            <Icon name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

function LiveChatContent() {
  const route = useRoute<ChatRoute>();
  const { appointmentId, doctorName: paramName } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<MappedMessage>>(null);
  const [draft, setDraft] = useState('');

  const { data, isLoading, isError } = useAppointmentChat(appointmentId);
  const sendMessage = useSendAppointmentMessage(appointmentId);

  const access = data?.access;
  const readOnly = access?.readOnly || !access?.allowed;
  const labels = getChatParticipantLabels(data?.appointment);

  const messages = (data?.messages || [])
    .map(item => mapChatMessage(item, user?.id, labels))
    .filter(Boolean) as MappedMessage[];

  useMarkChatReadOnOpen(appointmentId, access);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const doctorTitle = useMemo(() => {
    const raw =
      paramName ||
      labels.doctorName ||
      data?.appointment?.doctor?.name ||
      'Doctor';
    return shortDoctorName(String(raw));
  }, [paramName, labels.doctorName, data?.appointment?.doctor?.name]);

  const avatarUrl = data?.appointment?.doctor?.photo_url || null;

  const dateStamp = useMemo(() => {
    const first = messages.find(m => m.createdAt)?.createdAt;
    if (!first) {
      return `Today, ${formatTime(new Date().toISOString())}`;
    }
    const d = new Date(first);
    const today = new Date();
    const sameDay =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    const dayLabel = sameDay
      ? 'Today'
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${dayLabel}, ${formatTime(first)}`;
  }, [messages]);

  const videoAccess = data?.videoAccess;
  const canJoinVideo =
    videoAccess?.allowed &&
    data?.appointment?.meeting_id &&
    ['confirmed', 'in_progress'].includes(data?.appointment?.status || '');

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || readOnly) return;
    try {
      await sendMessage.mutateAsync({ message: text, message_type: 'text' });
      setDraft('');
    } catch {
      // ignore
    }
  };

  const handleJoinVideo = () => {
    const url =
      videoAccess?.joinUrl ||
      data?.appointment?.meeting_url ||
      (data?.appointment?.meeting_id
        ? `https://medzoos.com/consultation/${data.appointment.meeting_id}?appointment=${appointmentId}`
        : null);
    if (url) Linking.openURL(url);
  };

  return (
    <ScreenLayout
      headerMode="stack"
      showSearch={false}
      showCart={false}
      headerCenter={
        <ChatIdentity
          title={doctorTitle}
          subtitle="Online"
          avatarUrl={avatarUrl}
        />
      }>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        {access?.reason && (
          <View style={styles.notice}>
            <Icon
              name={readOnly ? 'information-outline' : 'clock-outline'}
              size={18}
              color={colors.primary700}
            />
            <Text style={styles.noticeText}>{access.reason}</Text>
          </View>
        )}

        {canJoinVideo && (
          <TouchableOpacity style={styles.videoBtn} onPress={handleJoinVideo}>
            <Icon name="video" size={18} color={colors.white} />
            <Text style={styles.videoBtnText}>Join video consultation</Text>
          </TouchableOpacity>
        )}

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary700} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>Could not load chat.</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.datePillWrap}>
                <View style={styles.datePill}>
                  <Text style={styles.datePillText}>{dateStamp}</Text>
                </View>
              </View>
            }
            renderItem={({ item }) => <MessageBubble message={item} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No messages yet. Send a message to your doctor.
              </Text>
            }
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {!readOnly && access?.allowed && (
          <View
            style={[
              styles.inputBar,
              { paddingBottom: Math.max(insets.bottom, spacing.sm) },
            ]}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Type a message..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={2000}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!draft.trim() || sendMessage.isPending) &&
                  styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!draft.trim() || sendMessage.isPending}>
              {sendMessage.isPending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Icon name="send" size={20} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

export function AppointmentChatScreen() {
  const route = useRoute<ChatRoute>();
  const isDemo = isDemoAppointmentId(route.params.appointmentId);

  if (isDemo) {
    return <DemoChatContent />;
  }

  return (
    <RequireAuthGate
      title="Sign in to chat"
      subtitle="Sign in to message your doctor."
      icon="message-text">
      <LiveChatContent />
    </RequireAuthGate>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnPressed: {
    opacity: 0.88,
    backgroundColor: colors.primary100,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: '100%',
  },
  headerCopy: {
    flexShrink: 1,
    minWidth: 0,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary100,
  },
  headerAvatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  onlineText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: { fontSize: 14, color: colors.textMuted },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primary100,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  videoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary700,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  videoBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
  datePillWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  datePill: {
    backgroundColor: colors.primary100,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  datePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary700,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xxxl,
  },
  systemWrap: { alignItems: 'center', marginVertical: spacing.sm },
  systemText: {
    fontSize: 12,
    color: colors.textMuted,
    backgroundColor: colors.surfaceBlue,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  bubbleBlock: {
    marginBottom: spacing.md,
    maxWidth: '82%',
    gap: 4,
  },
  bubbleBlockMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleBlockOther: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: {
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  bubbleMine: { backgroundColor: colors.brandBanner },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: { fontSize: 15, lineHeight: 21 },
  messageTextMine: { color: colors.white },
  messageTextOther: { color: colors.textPrimary },
  timeOutside: {
    fontSize: 11,
    color: colors.textMuted,
    marginHorizontal: spacing.xs,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
});
