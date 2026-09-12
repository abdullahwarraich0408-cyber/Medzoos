import React, { useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { authUi } from '../authUi';

const LENGTH = 6;

type OtpInputProps = {
  value: string;
  onChange: (next: string) => void;
  error?: string;
};

export function OtpInput({ value, onChange, error }: OtpInputProps) {
  const digits = String(value || '')
    .replace(/\D/g, '')
    .slice(0, LENGTH)
    .split('');
  while (digits.length < LENGTH) digits.push('');
  const refs = useRef<Array<TextInput | null>>([]);

  const updateAt = (index: number, next: string) => {
    const nextDigits = [...digits];
    nextDigits[index] = next;
    onChange(nextDigits.join(''));
  };

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, '');
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, LENGTH);
      onChange(pasted);
      refs.current[Math.min(pasted.length, LENGTH) - 1]?.focus();
      return;
    }
    updateAt(index, cleaned);
    if (cleaned && index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    index: number,
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      updateAt(index - 1, '');
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row} accessibilityLabel="Verification code">
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={el => {
              refs.current[index] = el;
            }}
            value={digit}
            onChangeText={text => handleChange(index, text)}
            onKeyPress={event => handleKeyPress(index, event)}
            keyboardType="number-pad"
            textContentType={index === 0 ? 'oneTimeCode' : 'none'}
            autoComplete={index === 0 ? 'sms-otp' : 'off'}
            maxLength={1}
            accessibilityLabel={`Digit ${index + 1} of ${LENGTH}`}
            style={[
              styles.box,
              digit ? styles.boxFilled : null,
              error ? styles.boxError : null,
            ]}
          />
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 24,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  box: {
    flex: 1,
    height: 56,
    maxWidth: 56,
    borderWidth: 1.5,
    borderColor: authUi.inputBorder,
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: authUi.ink,
    backgroundColor: authUi.inputBg,
  },
  boxFilled: {
    borderColor: authUi.accent,
    backgroundColor: authUi.inputFocusBg,
  },
  boxError: {
    borderColor: authUi.errorBorder,
  },
  error: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: authUi.errorText,
  },
});
