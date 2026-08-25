import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authUi } from '../authUi';

type AuthPrimaryButtonProps = {
  label: string;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  onPress: () => void;
  showArrow?: boolean;
  icon?: string;
};

export function AuthPrimaryButton({
  label,
  loading,
  loadingLabel,
  disabled,
  onPress,
  showArrow = false,
  icon,
}: AuthPrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, (disabled || loading) && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityState={{
        disabled: Boolean(disabled || loading),
        busy: Boolean(loading),
      }}>
      {loading ? (
        <>
          <ActivityIndicator color={authUi.white} />
          <Text style={styles.primaryBtnText}>{loadingLabel || label}</Text>
        </>
      ) : (
        <>
          {icon ? <Icon name={icon} size={20} color={authUi.white} /> : null}
          <Text style={styles.primaryBtnText}>{label}</Text>
          {showArrow ? (
            <Icon name="arrow-right" size={18} color={authUi.white} />
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
}

type AuthSecondaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function AuthSecondaryButton({
  label,
  onPress,
  disabled,
}: AuthSecondaryButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.secondaryBtn, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
      accessibilityRole="button">
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

type AuthLinkProps = {
  children: ReactNode;
  onPress: () => void;
};

export function AuthLink({ children, onPress }: AuthLinkProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      style={styles.linkWrap}>
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
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
    backgroundColor: authUi.medicalBlue,
    marginTop: 6,
    borderWidth: 1,
    borderColor: authUi.accent,
    shadowColor: authUi.medicalBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: authUi.secondaryBtnBg,
    borderWidth: 1,
    borderColor: authUi.secondaryBtnBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: authUi.accent,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: authUi.white,
  },
  linkWrap: {
    paddingVertical: 4,
  },
  link: {
    fontSize: 13,
    fontWeight: '700',
    color: authUi.accent,
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: authUi.inputBorder,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    color: authUi.divider,
  },
});
