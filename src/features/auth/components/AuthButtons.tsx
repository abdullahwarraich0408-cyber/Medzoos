import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authLayout } from '../authLayout';
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

/** DoctorApp Sign In CTA: solid primary teal, 12 radius, soft shadow, arrow. */
export function AuthPrimaryButton({
  label,
  loading,
  loadingLabel,
  disabled,
  onPress,
  showArrow = true,
  icon,
}: AuthPrimaryButtonProps) {
  const { s, isCompact } = authLayout;
  const height = s(isCompact ? 44 : 46);

  return (
    <TouchableOpacity
      style={[
        styles.primaryBtn,
        { height, borderRadius: 12, gap: s(6), marginTop: s(2) },
        (disabled || loading) && styles.btnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityState={{
        disabled: Boolean(disabled || loading),
        busy: Boolean(loading),
      }}>
      {loading ? (
        <>
          <ActivityIndicator color={authUi.white} size="small" />
          <Text style={[styles.primaryBtnText, { fontSize: s(13) }]}>
            {loadingLabel || label}
          </Text>
        </>
      ) : (
        <>
          {icon ? <Icon name={icon} size={s(16)} color={authUi.white} /> : null}
          <Text style={[styles.primaryBtnText, { fontSize: s(13) }]}>{label}</Text>
          {showArrow ? (
            <Icon name="arrow-right" size={s(16)} color={authUi.white} />
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
  const { s, isCompact } = authLayout;
  return (
    <TouchableOpacity
      style={[
        styles.secondaryBtn,
        { height: s(isCompact ? 44 : 46), borderRadius: 12 },
        disabled && styles.btnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
      accessibilityRole="button">
      <Text style={[styles.secondaryBtnText, { fontSize: s(13) }]}>{label}</Text>
    </TouchableOpacity>
  );
}

type AuthLinkProps = {
  children: ReactNode;
  onPress: () => void;
  muted?: boolean;
};

export function AuthLink({ children, onPress, muted }: AuthLinkProps) {
  const { s } = authLayout;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      style={styles.linkWrap}>
      <Text
        style={[
          styles.link,
          { fontSize: s(13) },
          muted && styles.linkMuted,
        ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

type AuthDividerProps = {
  label?: string;
};

export function AuthDivider({ label = 'OR' }: AuthDividerProps) {
  const { s } = authLayout;
  return (
    <View style={[styles.dividerWrap, { gap: s(12), marginTop: s(4) }]}>
      <View style={styles.dividerLine} />
      <Text style={[styles.dividerText, { fontSize: s(12) }]}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authUi.accent,
    ...Platform.select({
      ios: {
        shadowColor: authUi.ink,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  secondaryBtn: {
    backgroundColor: authUi.secondaryBtnBg,
    borderWidth: 1,
    borderColor: authUi.secondaryBtnBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  secondaryBtnText: {
    fontWeight: '700',
    color: authUi.accent,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    fontWeight: '700',
    color: authUi.white,
    letterSpacing: 0.2,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  linkWrap: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  link: {
    fontWeight: '600',
    color: authUi.accent,
    letterSpacing: 0.15,
  },
  linkMuted: {
    color: authUi.muted,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: authUi.inputBorder,
  },
  dividerText: {
    fontWeight: '500',
    color: authUi.iconMuted,
    letterSpacing: 0.2,
  },
});
