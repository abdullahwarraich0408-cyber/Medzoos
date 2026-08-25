import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}>
        {icon ? (
          <Icon
            name={icon}
            size={18}
            color={focused ? authUi.accent : authUi.iconMuted}
          />
        ) : null}
        <TextInput
          style={[styles.input, style]}
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
              size={20}
              color={authUi.iconMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 6,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: authUi.muted,
    marginBottom: 6,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: authUi.inputBorder,
    borderRadius: 16,
    backgroundColor: authUi.inputBg,
    paddingHorizontal: 16,
    gap: 10,
  },
  inputFocused: {
    borderColor: authUi.accent,
    backgroundColor: authUi.inputFocusBg,
  },
  inputError: {
    borderColor: authUi.errorBorder,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: authUi.white,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: authUi.errorText,
  },
});
