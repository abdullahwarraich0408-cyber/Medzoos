import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../components/layout/ScreenLayout';
import { HealthPageHeader } from '../health/components/hub/HealthPageHeader';
import { CollapsibleSection, SimpleMessage } from '../../design-system';
import { CopilotMessageBubble } from './components/CopilotMessageBubble';
import { copilotCopy } from '../../lib/copy/uiMessages';
import { useCopilot } from '../../lib/copilot/useCopilot';
import type { CopilotAction } from '../../lib/copilot/types';
import { navigateToServices, navigateToTabScreen } from '../../lib/auth/navigation';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../theme';
import { calmLayout } from '../../theme/calmLayout';
import { healthOs, healthOsTypography } from '../../theme/healthOs';
import type { CopilotStackParamList, MainTabParamList } from '../../navigation/types';

type CopilotRoute = RouteProp<CopilotStackParamList, 'CopilotHome'>;

type CopilotNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Copilot'>,
  import('@react-navigation/native').NavigationProp<CopilotStackParamList>
>;

const QUICK_EXAMPLES = [
  'I have chest pain',
  'I have fever since last night',
  'Explain my lab report',
  'I missed my medicine',
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
    isLoading,
    initializeSession,
    sendMessage,
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
  }, [messages.length]);

  const handleSend = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      sendMessage(trimmed);
      setInput('');
    },
    [sendMessage],
  );

  const handleActionPress = useCallback(
    (action: CopilotAction) => {
      if (action.type === 'emergency_alert') {
        Linking.openURL('tel:1122');
        return;
      }

      const nav = action.navigation;
      if (!nav) return;

      if (nav.tab === 'Home' && nav.screen === 'Services') {
        const params = nav.params as { screen?: string; params?: object } | undefined;
        navigateToServices(
          navigation,
          params?.screen ?? 'ConsultHome',
          params?.params,
        );
        return;
      }

      navigateToTabScreen(navigation, nav.tab === 'You' ? 'You' : nav.tab, nav.screen, nav.params);
    },
    [navigation],
  );

  return (
    <ScreenLayout title="Copilot" showSearch={false} showCart={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <HealthPageHeader
            subtitle={
              session?.phase ? phaseLabel(session.phase) : undefined
            }
          />

          {isLoading && messages.length === 0 ? (
            <ActivityIndicator color={healthOs.copilotGlow} style={styles.loader} />
          ) : null}

          {messages.map(msg => (
            <CopilotMessageBubble
              key={msg.id}
              message={msg}
              onActionPress={handleActionPress}
              onSuggestedReply={handleSend}
            />
          ))}

          {messages.length === 0 && isReady ? (
            <>
              <SimpleMessage message={copilotCopy.welcome} tone="info" />
              <View style={styles.examples}>
                {QUICK_EXAMPLES.map(example => (
                  <Pressable
                    key={example}
                    style={styles.exampleBtn}
                    onPress={() => handleSend(example)}>
                    <Text style={styles.exampleText}>{example}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          <CollapsibleSection title="Emergency info">
            <SimpleMessage message={copilotCopy.safetyNote} tone="warning" />
          </CollapsibleSection>
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder={copilotCopy.inputPlaceholder}
            placeholderTextColor={colors.neutral500}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend(input)}
            returnKeyType="send"
            multiline
          />
          <Pressable
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend(input)}
            disabled={!input.trim()}
            accessibilityLabel="Send message">
            <Icon name="send" size={20} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: calmLayout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: calmLayout.sectionGap,
  },
  loader: { marginVertical: spacing.xl },
  examples: { gap: calmLayout.blockGap },
  exampleBtn: {
    backgroundColor: colors.surfaceBase,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  exampleText: { ...healthOsTypography.messageTitle, fontSize: 15 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: calmLayout.screenPadding,
    paddingVertical: spacing.md,
    paddingBottom: TAB_BAR_CLEARANCE + spacing.sm,
    borderTopWidth: 1,
    borderTopColor: healthOs.messageBorder,
    backgroundColor: colors.surfaceBase,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink900,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: healthOs.copilotGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
