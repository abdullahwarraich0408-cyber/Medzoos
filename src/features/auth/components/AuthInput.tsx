import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { authLayout } from '../authLayout';
import { authUi } from '../authUi';

type AuthInputProps = TextInputProps & {
  label: string;
  icon?: string;
  error?: string;
  isPassword?: boolean;
};

export function AuthInput({
  label,
  icon,
  error,
  isPassword,
  style,
  secureTextEntry,
  onFocus,
  onBlur,
  ...props
}: AuthInputProps) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const secure = Boolean(isPassword || secureTextEntry) && !visible;
  const { s, isCompact } = authLayout;
  const fieldH = s(isCompact ? 46 : 48);

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.label,
          { fontSize: s(12), marginBottom: s(8), letterSpacing: 0.2 },
        ]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputRow,
          {
            height: fieldH,
            borderRadius: 12,
            paddingHorizontal: s(14),
            gap: s(10),
          },
          focused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}>
        {icon ? (
          <Icon
            name={icon}
            size={s(17)}
            color={focused ? authUi.accent : authUi.iconMuted}
          />
        ) : null}
        <TextInput
          style={[styles.input, { fontSize: s(14), letterSpacing: 0.1 }, style]}
          placeholderTextColor={authUi.iconMuted}
          secureTextEntry={secure}
          onFocus={event => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={event => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...props}
        />
        {isPassword || secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setVisible(v => !v)}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={s(18)}
              color={authUi.iconMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? (
        <Text style={[styles.error, { fontSize: s(12), marginTop: s(6) }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  label: {
    fontWeight: '600',
    color: authUi.muted,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: authUi.inputBorder,
    backgroundColor: authUi.white,
  },
  inputFocused: {
    borderColor: authUi.accent,
    backgroundColor: authUi.iceBlue,
  },
  inputError: {
    borderColor: authUi.errorBorder,
    backgroundColor: authUi.errorBg,
  },
  input: {
    flex: 1,
    fontWeight: '400',
    color: authUi.ink,
    paddingVertical: 0,
    paddingHorizontal: 0,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  error: {
    fontWeight: '600',
    color: authUi.errorText,
  },
});
