import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../components/layout/ScreenLayout';
import { KeyboardAvoidingContainer } from '../../components/keyboard';
import { CollapsibleSection, SimpleMessage } from '../../design-system';
import { CopilotMessageBubble } from './components/CopilotMessageBubble';
import { copilotCopy } from '../../lib/copy/uiMessages';
import { useCopilot } from '../../lib/copilot/useCopilot';
import type { CopilotAction } from '../../lib/copilot/types';
import {
  navigateToServices,
  navigateToTabScreen,
} from '../../lib/auth/navigation';
import { spacing, radius } from '../../theme';
import { copilotBrand } from './copilotBrand';
import type {
  CopilotStackParamList,
  MainTabParamList,
} from '../../navigation/types';

type CopilotRoute = RouteProp<CopilotStackParamList, 'CopilotHome'>;

type CopilotNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Copilot'>,
  import('@react-navigation/native').NavigationProp<CopilotStackParamList>
>;

const QUICK_EXAMPLES: { label: string; icon: string }[] = [
  { label: 'I have chest pain', icon: 'heart-pulse' },
  { label: 'I need a doctor', icon: 'doctor' },
  { label: 'My back hurts', icon: 'human-handsdown' },
  { label: 'I have fever since last night', icon: 'thermometer' },
];

export function CopilotHomeScreen() {
  const route = useRoute<CopilotRoute>();
  const navigation = useNavigation<CopilotNav>();
  const scrollRef = useRef<ScrollView>(null);
  const initialPromptSent = useRef(false);

  const {
    messages,
    session,
    isReady,
    isThinking,
    isLoading,
    initializeSession,
    sendMessage,
    startNewChat,
  } = useCopilot();

  const [input, setInput] = React.useState(route.params?.initialPrompt ?? '');

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    if (
      route.params?.initialPrompt &&
      isReady &&
      !initialPromptSent.current
    ) {
      initialPromptSent.current = true;
      sendMessage(route.params.initialPrompt);
      setInput('');
    }
  }, [route.params?.initialPrompt, isReady, sendMessage]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, isThinking]);

  const handleSend = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isThinking) return;
      sendMessage(trimmed);
      setInput('');
    },
    [sendMessage, isThinking],
  );

  const handleNewChat = useCallback(() => {
    initialPromptSent.current = false;
    setInput('');
    startNewChat();
  }, [startNewChat]);

  const handleActionPress = useCallback(
    (action: CopilotAction) => {
      if (
        action.type === 'emergency_alert' ||
        action.type === 'call_emergency' ||
        action.params?.phone === '1122'
      ) {
        Linking.openURL('tel:1122');
        return;
      }

      if (
        action.type === 'symptom_tracker' ||
        action.label === 'Track Symptoms'
      ) {
        sendMessage(
          'How can I monitor these symptoms safely and what red flags should I watch for?',
        );
        return;
      }

      const nav = action.navigation;
      if (!nav?.screen) {
        if (action.targetScreen === 'DoctorsList') {
          navigateToServices(navigation, 'DoctorsList', action.params);
        } else if (action.targetScreen === 'LabTestsList') {
          navigateToServices(navigation, 'LabTestsList', action.params);
        } else if (action.targetScreen === 'HospitalsList') {
          navigateToServices(navigation, 'HospitalsList', action.params);
        } else if (
          action.targetScreen === 'MedicinesList' ||
          action.targetScreen === 'HealthHome'
        ) {
          navigateToTabScreen(
            navigation,
            'Health',
            action.targetScreen,
            action.params,
          );
        }
        return;
      }

      if (nav.tab === 'Home' && nav.screen === 'Services') {
        const params = nav.params as
          | { screen?: string; params?: object }
          | undefined;
        navigateToServices(
          navigation,
          params?.screen ?? 'ConsultHome',
          params?.params,
        );
        return;
      }

      navigateToTabScreen(
        navigation,
        (nav.tab as any) || 'Home',
        nav.screen,
        nav.params,
      );
    },
    [navigation, sendMessage],
  );

  const phase = session?.phase ? phaseLabel(session.phase) : '';

  return (
    <ScreenLayout
      title="Medzoos"
      showSearch={false}
      showCart={false}
      backgroundColor={copilotBrand.page}
      headerRight={
        <Pressable
          onPress={handleNewChat}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Start new chat"
          style={styles.newChatBtn}>
          <Icon
            name="square-edit-outline"
            size={20}
            color={copilotBrand.accent}
          />
        </Pressable>
      }>
      <KeyboardAvoidingContainer style={styles.flex}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {phase ? (
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{phase}</Text>
            </View>
          ) : null}

          {messages.length > 0 ? (
            <Pressable
              style={styles.newChatBanner}
              onPress={handleNewChat}
              accessibilityRole="button">
              <Icon name="plus" size={16} color={copilotBrand.accent} />
              <Text style={styles.newChatBannerText}>New chat</Text>
            </Pressable>
          ) : null}

          {isLoading && messages.length === 0 ? (
            <ActivityIndicator
              color={copilotBrand.accent}
              style={styles.loader}
            />
          ) : null}

          {messages.map(msg => (
            <CopilotMessageBubble
              key={msg.id}
              message={msg}
              onActionPress={handleActionPress}
              onSuggestedReply={handleSend}
            />
          ))}

          {isThinking ? (
            <View style={styles.thinkingContainer}>
              <View style={styles.thinkingBubble}>
                <ActivityIndicator
                  size="small"
                  color={copilotBrand.accent}
                />
                <Text style={styles.thinkingText}>Medzoos is thinking…</Text>
              </View>
            </View>
          ) : null}

          {messages.length === 0 && isReady ? (
            <>
              <View style={styles.welcomeCard}>
                <View style={styles.welcomeOrb} />
                <View style={styles.welcomeIcon}>
                  <Icon
                    name="robot-outline"
                    size={22}
                    color={copilotBrand.accent}
                  />
                </View>
                <Text style={styles.welcomeKicker}>AI health assistant</Text>
                <Text style={styles.welcomeTitle}>How can Medzoos help?</Text>
                <Text style={styles.welcomeBody}>{copilotCopy.welcome}</Text>
              </View>

              <Text style={styles.examplesLabel}>Try asking</Text>
              <View style={styles.examples}>
                {QUICK_EXAMPLES.map(example => (
                  <Pressable
                    key={example.label}
                    style={styles.exampleBtn}
                    onPress={() => handleSend(example.label)}>
                    <View style={styles.exampleIcon}>
                      <Icon
                        name={example.icon}
                        size={14}
                        color={copilotBrand.accent}
                      />
                    </View>
                    <Text style={styles.exampleText}>{example.label}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          <View style={styles.emergencyWrap}>
            <CollapsibleSection title="Emergency info">
              <SimpleMessage message={copilotCopy.safetyNote} tone="warning" />
            </CollapsibleSection>
          </View>
        </ScrollView>

        <View style={styles.inputBar}>
          <View style={styles.inputShell}>
            <TextInput
              style={styles.input}
              placeholder={copilotCopy.inputPlaceholder}
              placeholderTextColor={copilotBrand.muted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => handleSend(input)}
              returnKeyType="send"
              multiline
              editable={!isThinking}
            />
          </View>
          <Pressable
            style={[
              styles.sendBtn,
              (!input.trim() || isThinking) && styles.sendBtnDisabled,
            ]}
            onPress={() => handleSend(input)}
            disabled={!input.trim() || isThinking}
            accessibilityLabel="Send message">
            {isThinking ? (
              <ActivityIndicator size="small" color={copilotBrand.onAccent} />
            ) : (
              <Icon name="send" size={18} color={copilotBrand.onAccent} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingContainer>
    </ScreenLayout>
  );
}

function phaseLabel(phase: string): string {
  switch (phase) {
    case 'greeting':
      return 'Reading your health context…';
    case 'intent':
      return 'Understanding your request';
    case 'questions':
      return 'Gathering details';
    case 'assessment':
      return 'Assessing risk';
    case 'actions':
      return 'Ready — choose your next step';
    case 'monitoring':
      return 'Monitoring your care';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },

  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: copilotBrand.soft,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: copilotBrand.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: copilotBrand.accent,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: copilotBrand.accent,
  },

  newChatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: copilotBrand.soft,
    borderWidth: 1,
    borderColor: copilotBrand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatBanner: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: copilotBrand.card,
    borderWidth: 1,
    borderColor: copilotBrand.border,
  },
  newChatBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: copilotBrand.accent,
  },

  loader: { marginVertical: spacing.xl },

  welcomeCard: {
    backgroundColor: copilotBrand.accent,
    borderRadius: 22,
    padding: spacing.lg,
    overflow: 'hidden',
    gap: 6,
  },
  welcomeOrb: {
    position: 'absolute',
    top: -36,
    right: -28,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  welcomeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: copilotBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  welcomeKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.78)',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.35,
    color: copilotBrand.onAccent,
  },
  welcomeBody: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.86)',
    marginTop: 2,
  },

  examplesLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: copilotBrand.ink,
    marginTop: 4,
  },
  examples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: copilotBrand.card,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: copilotBrand.border,
    paddingVertical: 10,
    paddingLeft: 8,
    paddingRight: 14,
    ...Platform.select({
      ios: {
        shadowColor: copilotBrand.ink,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  exampleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: copilotBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exampleText: {
    fontSize: 13,
    fontWeight: '700',
    color: copilotBrand.ink,
  },

  emergencyWrap: {
    marginTop: spacing.sm,
    backgroundColor: copilotBrand.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: copilotBrand.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  thinkingContainer: {
    alignSelf: 'flex-start',
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: copilotBrand.card,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: copilotBrand.border,
  },
  thinkingText: {
    fontSize: 13,
    color: copilotBrand.muted,
    fontWeight: '600',
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    borderTopWidth: 1,
    borderTopColor: copilotBrand.border,
    backgroundColor: copilotBrand.card,
  },
  inputShell: {
    flex: 1,
    backgroundColor: copilotBrand.page,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: copilotBrand.border,
    paddingHorizontal: 4,
  },
  input: {
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: copilotBrand.ink,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: copilotBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: copilotBrand.accent,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  sendBtnDisabled: { opacity: 0.4 },
});
