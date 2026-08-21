import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../../../theme';

type AuthPrimaryButtonProps = {
  label: string;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  onPress: () => void;
  showArrow?: boolean;
};

export function AuthPrimaryButton({
  label,
  loading,
  loadingLabel,
  disabled,
  onPress,
  showArrow = true,
}: AuthPrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.btn, (disabled || loading) && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }}>
      {loading ? (
        <>
          <ActivityIndicator color={colors.white} />
          <Text style={styles.btnText}>{loadingLabel || label}</Text>
        </>
      ) : (
        <>
          <Text style={styles.btnText}>{label}</Text>
          {showArrow ? <Icon name="arrow-right" size={18} color={colors.white} /> : null}
        </>
      )}
    </TouchableOpacity>
  );
}

type AuthLinkProps = {
  children: ReactNode;
  onPress: () => void;
};

export function AuthLink({ children, onPress }: AuthLinkProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} accessibilityRole="button">
      <Text style={styles.link}>{children}</Text>
    </TouchableOpacity>
  );
}

export function AuthDivider() {
  return (
    <View style={styles.dividerWrap}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>or continue with</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: colors.brandPrimary,
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.2,
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral500,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
