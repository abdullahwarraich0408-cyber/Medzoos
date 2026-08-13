import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius } from '../../../theme';

type AuthPrimaryButtonProps = {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function AuthPrimaryButton({
  label,
  loading,
  disabled,
  onPress,
}: AuthPrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.btn, (disabled || loading) && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}>
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <>
          <Text style={styles.btnText}>{label}</Text>
          <Icon name="arrow-right" size={18} color={colors.white} />
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
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.link}>{children}</Text>
    </TouchableOpacity>
  );
}

export function AuthDivider() {
  return (
    <View style={styles.dividerWrap}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>OR</Text>
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
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primary700,
    marginTop: spacing.sm,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
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
    height: 1,
    backgroundColor: colors.neutral200,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral500,
    letterSpacing: 0.5,
  },
});
