import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { CopilotAction, CopilotMessagePayload } from '../../../lib/copilot/types';
import { CopilotRiskBadge } from './CopilotRiskBadge';
import { CopilotActionCard } from './CopilotActionCard';
import { copilotCopy } from '../../../lib/copy/uiMessages';
import { MEDICAL_DISCLAIMER } from '../../../lib/copilot/engines/riskEngine';
import { colors, spacing, radius } from '../../../theme';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';

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
    <View style={styles.block}>
      <Text style={styles.roleLabel}>
        {isUser ? copilotCopy.youLabel : copilotCopy.copilotLabel}
      </Text>

      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {message.riskLevel && !isUser ? (
          <View style={styles.riskRow}>
            <CopilotRiskBadge level={message.riskLevel} />
          </View>
        ) : null}

        <Text style={[styles.text, isUser && styles.userText]}>{message.text}</Text>

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

      {!isUser && message.suggestedReplies && message.suggestedReplies.length > 0 ? (
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
  block: { gap: spacing.xs, marginBottom: spacing.md },
  roleLabel: healthOsTypography.label,
  bubble: { borderRadius: radius.lg, padding: spacing.lg, maxWidth: '100%' },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.brandPrimary,
    maxWidth: '90%',
  },
  aiBubble: {
    alignSelf: 'stretch',
    backgroundColor: colors.surfaceBase,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    gap: spacing.md,
  },
  text: healthOsTypography.messageBody,
  userText: { color: colors.white },
  riskRow: { marginBottom: spacing.xs },
  diffBlock: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  diffTitle: { ...healthOsTypography.label, marginBottom: spacing.xs },
  diffItem: { ...healthOsTypography.messageBody, fontSize: 13, color: colors.neutral700 },
  actions: { gap: spacing.sm },
  actionsTitle: { ...healthOsTypography.messageTitle, fontSize: 14 },
  disclaimer: {
    ...healthOsTypography.messageBody,
    fontSize: 11,
    color: colors.neutral500,
    fontStyle: 'italic',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  suggestionChip: {
    backgroundColor: colors.surfaceBase,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  suggestionText: { ...healthOsTypography.messageBody, fontSize: 13, color: colors.brandPrimary },
});
