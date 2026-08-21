import { colors, spacing } from '../../../theme';
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
            color={focused ? colors.brandPrimary : colors.neutral500}
            style={styles.icon}
          />
        ) : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#8AA0B2"
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
              color={colors.neutral600}
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
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.brandMist,
    paddingHorizontal: spacing.md,
  },
  inputFocused: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.inkHeadline,
    paddingVertical: 14,
    paddingHorizontal: 0,
  },
  error: {
    marginTop: 6,
    fontSize: 13,
    color: colors.error,
  },
});
