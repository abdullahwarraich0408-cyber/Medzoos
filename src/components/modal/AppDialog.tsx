import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { AppAlertButton } from '../../lib/ui/appAlert';
import { colors, spacing, radius, shadows } from '../../theme';
import { healthOs, healthOsTypography } from '../../theme/healthOs';

export type AppDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AppAlertButton[];
  onDismiss: () => void;
};

function getDialogIcon(buttons: AppAlertButton[]) {
  if (buttons.some(b => b.style === 'destructive')) {
    return { name: 'alert-circle-outline', color: colors.statusDanger, bg: '#FEE2E2' };
  }
  if (buttons.length > 1) {
    return { name: 'information-outline', color: colors.brandPrimary, bg: colors.brandLight };
  }
  return { name: 'check-circle-outline', color: colors.brandPrimary, bg: colors.brandLight };
}

function sortButtons(buttons: AppAlertButton[]) {
  const cancel = buttons.filter(b => b.style === 'cancel');
  const destructive = buttons.filter(b => b.style === 'destructive');
  const primary = buttons.filter(b => b.style !== 'cancel' && b.style !== 'destructive');
  return [...primary, ...destructive, ...cancel];
}

function partitionButtons(buttons: AppAlertButton[]) {
  const ordered = sortButtons(buttons);
  const cancel = ordered.filter(b => b.style === 'cancel');
  const nonCancel = ordered.filter(b => b.style !== 'cancel');
  const destructive = nonCancel.filter(b => b.style === 'destructive');
  const defaults = nonCancel.filter(b => b.style !== 'destructive');

  let primary: AppAlertButton | undefined;
  let secondary: AppAlertButton[] = [];

  if (defaults.length === 1 && destructive.length === 0) {
    primary = defaults[0];
  } else if (defaults.length >= 1 && destructive.length === 0 && defaults.length <= 2) {
    primary = defaults[0];
    secondary = defaults.slice(1);
  } else {
    secondary = [...defaults, ...destructive];
  }

  return { primary, secondary, cancel };
}

export function AppDialog({
  visible,
  title,
  message,
  buttons = [{ text: 'OK' }],
  onDismiss,
}: AppDialogProps) {
  const { primary, secondary, cancel } = partitionButtons(buttons);
  const icon = getDialogIcon(buttons);

  const handlePress = (button: AppAlertButton) => {
    onDismiss();
    button.onPress?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (cancel.length > 0) handlePress(cancel[0]);
        else onDismiss();
      }}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
            <Icon name={icon.name} size={28} color={icon.color} />
          </View>

          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            {primary ? (
              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  pressed && styles.primaryBtnPressed,
                ]}
                onPress={() => handlePress(primary)}>
                <Text style={styles.primaryBtnText}>{primary.text}</Text>
              </Pressable>
            ) : null}

            {secondary.map(button => (
              <Pressable
                key={button.text}
                style={({ pressed }) => [
                  button.style === 'destructive' ? styles.destructiveBtn : styles.secondaryBtn,
                  pressed && styles.secondaryBtnPressed,
                ]}
                onPress={() => handlePress(button)}>
                <Text
                  style={
                    button.style === 'destructive'
                      ? styles.destructiveBtnText
                      : styles.secondaryBtnText
                  }>
                  {button.text}
                </Text>
              </Pressable>
            ))}

            {cancel.map(button => (
              <Pressable
                key={button.text}
                style={({ pressed }) => [styles.cancelBtn, pressed && styles.cancelBtnPressed]}
                onPress={() => handlePress(button)}>
                <Text style={styles.cancelBtnText}>{button.text}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(12, 26, 46, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    ...shadows.cardElevated,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 18,
    textAlign: 'center',
    color: colors.inkHeadline,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.neutral600,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  primaryBtnPressed: {
    backgroundColor: colors.brandDark,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.18)',
    backgroundColor: colors.white,
  },
  secondaryBtnPressed: {
    backgroundColor: colors.brandMist,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  destructiveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  destructiveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.statusDanger,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cancelBtnPressed: { opacity: 0.7 },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral500,
  },
});
