import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../../../theme';
import {
  AUTH_COUNTRIES,
  type AuthCountry,
} from '../lib/phoneCountries';

type PhoneInputProps = {
  country: AuthCountry;
  onCountryChange: (country: AuthCountry) => void;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  editable?: boolean;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
  actionDisabled?: boolean;
};

export function PhoneInput({
  country,
  onCountryChange,
  value,
  onChange,
  error,
  editable = true,
  hint = 'A verification code will be sent to this number.',
  actionLabel = 'Verify',
  onAction,
  actionLoading,
  actionDisabled,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Mobile number</Text>
      <View style={[styles.row, error ? styles.rowError : null]}>
        <TouchableOpacity
          style={styles.countryBtn}
          onPress={() => setOpen(true)}
          disabled={!editable}
          accessibilityRole="button"
          accessibilityLabel={`Country, ${country.name} ${country.dial}`}>
          <Text style={styles.flag}>{country.flag}</Text>
          <Text style={styles.dial}>{country.dial}</Text>
          <Icon name="chevron-down" size={16} color={colors.neutral600} />
        </TouchableOpacity>
        <TextInput
          value={value}
          onChangeText={text => onChange(text.replace(/[^\d\s]/g, ''))}
          placeholder={country.placeholder}
          placeholderTextColor="#8AA0B2"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          editable={editable}
          style={styles.input}
          accessibilityLabel="Mobile number"
        />
        {onAction ? (
          <TouchableOpacity
            style={[styles.verifyBtn, (actionDisabled || actionLoading) && styles.verifyDisabled]}
            onPress={onAction}
            disabled={!editable || actionDisabled || actionLoading}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}>
            {actionLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.verifyText}>{actionLabel}</Text>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select country</Text>
            <FlatList
              data={AUTH_COUNTRIES}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onCountryChange(item);
                    setOpen(false);
                  }}
                  accessibilityRole="button">
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text style={styles.optionName}>{item.name}</Text>
                  <Text style={styles.optionDial}>{item.dial}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.inkHeadline,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#D9E5EC',
    borderRadius: 14,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  rowError: {
    borderColor: '#D92D20',
  },
  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    minHeight: 52,
    borderRightWidth: 1,
    borderRightColor: '#D9E5EC',
  },
  flag: {
    fontSize: 16,
  },
  dial: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.inkHeadline,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  verifyBtn: {
    marginRight: 6,
    minHeight: 36,
    minWidth: 72,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#087F8C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyDisabled: {
    opacity: 0.5,
  },
  verifyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: '#7A8F8D',
  },
  error: {
    marginTop: 6,
    fontSize: 13,
    color: '#D92D20',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(8,43,63,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: '70%',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    gap: 12,
  },
  optionName: {
    flex: 1,
    fontSize: 15,
    color: colors.inkHeadline,
  },
  optionDial: {
    fontSize: 14,
    color: colors.neutral600,
  },
});
