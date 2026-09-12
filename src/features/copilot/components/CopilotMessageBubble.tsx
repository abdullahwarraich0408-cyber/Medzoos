import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type {
  CopilotAction,
  CopilotMessagePayload,
} from '../../../lib/copilot/types';
import { CopilotRiskBadge } from './CopilotRiskBadge';
import { CopilotActionCard } from './CopilotActionCard';
import { copilotCopy } from '../../../lib/copy/uiMessages';
import { MEDICAL_DISCLAIMER } from '../../../lib/copilot/engines/riskEngine';
import { copilotBrand } from '../copilotBrand';
import { spacing, radius } from '../../../theme';

type CopilotMessageBubbleProps = {
  message: CopilotMessagePayload;
  onActionPress: (action: CopilotAction) => void;
  onSuggestedReply?: (text: string) => void;
};

export function CopilotMessageBubble({
  message,
  onActionPress,
  onSuggestedReply,
}: CopilotMessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.block, isUser && styles.blockUser]}>
      <View style={[styles.roleRow, isUser && styles.roleRowUser]}>
        {!isUser ? (
          <View style={styles.aiAvatar}>
            <Icon name="robot-outline" size={12} color={copilotBrand.onAccent} />
          </View>
        ) : null}
        <Text style={[styles.roleLabel, isUser && styles.roleLabelUser]}>
          {isUser ? copilotCopy.youLabel : copilotCopy.copilotLabel}
        </Text>
      </View>

      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {!isUser && (message.triageLevel || message.riskLevel) ? (
          <View style={styles.riskRow}>
            {message.riskLevel ? (
              <CopilotRiskBadge level={message.riskLevel} />
            ) : null}
            {message.triageLevel ? (
              <Text style={styles.triageMeta}>{String(message.triageLevel)}</Text>
            ) : null}
            {message.reasonCode ? (
              <Text style={styles.triageMeta}>{message.reasonCode}</Text>
            ) : null}
          </View>
        ) : null}

        <Text style={[styles.text, isUser && styles.userText]}>
          {message.text}
        </Text>

        {!isUser && message.differentials && message.differentials.length > 0 ? (
          <View style={styles.diffBlock}>
            <Text style={styles.diffTitle}>Possible causes (not a diagnosis)</Text>
            {message.differentials.map((d, i) => (
              <Text key={i} style={styles.diffItem}>
                • {d.condition} — {d.confidence} confidence
                {d.note ? ` (${d.note})` : ''}
              </Text>
            ))}
          </View>
        ) : null}

        {!isUser && message.actions && message.actions.length > 0 ? (
          <View style={styles.actions}>
            <Text style={styles.actionsTitle}>Your next step</Text>
            {message.actions.map((action, i) => (
              <CopilotActionCard
                key={action.id}
                action={action}
                onPress={onActionPress}
                isPrimary={i === 0}
              />
            ))}
          </View>
        ) : null}

        {!isUser && message.disclaimer ? (
          <Text style={styles.disclaimer}>{MEDICAL_DISCLAIMER}</Text>
        ) : null}
      </View>

      {!isUser &&
      message.suggestedReplies &&
      message.suggestedReplies.length > 0 ? (
        <View style={styles.suggestions}>
          {message.suggestedReplies.map(reply => (
            <Pressable
              key={reply}
              style={styles.suggestionChip}
              onPress={() => onSuggestedReply?.(reply)}>
              <Text style={styles.suggestionText}>{reply}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 6,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  blockUser: {
    alignItems: 'flex-end',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  roleRowUser: {
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: copilotBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: copilotBrand.muted,
  },
  roleLabelUser: {
    color: copilotBrand.accentSoft,
  },
  bubble: {
    borderRadius: 18,
    padding: spacing.md,
    maxWidth: '100%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: copilotBrand.accent,
    maxWidth: '88%',
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    alignSelf: 'stretch',
    backgroundColor: copilotBrand.card,
    borderWidth: 1,
    borderColor: copilotBrand.border,
    gap: spacing.sm + 2,
    borderBottomLeftRadius: 6,
    ...Platform.select({
      ios: {
        shadowColor: copilotBrand.ink,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: copilotBrand.ink,
  },
  userText: {
    color: copilotBrand.onAccent,
  },
  riskRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  triageMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: copilotBrand.muted,
  },
  diffBlock: {
    backgroundColor: copilotBrand.page,
    borderRadius: 14,
    padding: spacing.sm + 2,
    gap: 4,
    borderWidth: 1,
    borderColor: copilotBrand.border,
  },
  diffTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: copilotBrand.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  diffItem: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: copilotBrand.ink,
  },
  actions: { gap: spacing.sm },
  actionsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: copilotBrand.ink,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: copilotBrand.muted,
    fontStyle: 'italic',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  suggestionChip: {
    backgroundColor: copilotBrand.soft,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: copilotBrand.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '700',
    color: copilotBrand.accent,
  },
});
