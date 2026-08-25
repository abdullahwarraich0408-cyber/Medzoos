import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../lib/auth/AuthContext';
import type { Doctor } from '../../../lib/mappers/doctor';
import {
  KeyboardAwareScrollView,
  KeyboardAvoidingContainer,
} from '../../../components/keyboard';

import type { ConsultOption } from '../utils/consultOptions';
import { formatShortSlot } from '../utils/bookingUtils';

type BookingAuthModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  doctor: Doctor;
  consultOption: ConsultOption | null;
  selectedDate: string;
  selectedSlot: string | null;
};

export function BookingAuthModal({
  visible,
  onClose,
  onSuccess,
  doctor,
  consultOption,
  selectedDate,
  selectedSlot,
}: BookingAuthModalProps) {
  const { loginWithEmail, registerWithEmail } = useAuth();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setMode('signin');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      Alert.alert('Missing fields', 'Please enter your name.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await loginWithEmail(email.trim(), password);
      } else {
        await registerWithEmail({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
        });
      }
      resetForm();
      onSuccess();
    } catch (err) {
      Alert.alert(
        mode === 'signin' ? 'Sign in failed' : 'Registration failed',
        err instanceof Error ? err.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}>
      <KeyboardAvoidingContainer style={styles.overlay} enabled={visible}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Icon name="close" size={22} color={colors.neutral500} />
          </TouchableOpacity>

          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            disableKeyboardInset>
            <Text style={styles.title}>
              {mode === 'signin' ? 'Sign in to book' : 'Create account'}
            </Text>
            <Text style={styles.subtitle}>
              Sign in or register to complete your appointment booking.
            </Text>

            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, mode === 'signin' && styles.tabActive]}
                onPress={() => setMode('signin')}>
                <Text
                  style={[
                    styles.tabText,
                    mode === 'signin' && styles.tabTextActive,
                  ]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, mode === 'register' && styles.tabActive]}
                onPress={() => setMode('register')}>
                <Text
                  style={[
                    styles.tabText,
                    mode === 'register' && styles.tabTextActive,
                  ]}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>

            {mode === 'register' && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Full name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={colors.neutral500}
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.neutral500}
              />
            </View>

            {mode === 'register' && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Phone (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="03XX XXXXXXX"
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.neutral500}
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                secureTextEntry
                placeholderTextColor={colors.neutral500}
              />
            </View>

            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>YOUR APPOINTMENT</Text>
              <View style={styles.summaryRow}>
                <Image source={{ uri: doctor.photo }} style={styles.avatar} />
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryName}>{doctor.name}</Text>
                  <Text style={styles.summaryLocation}>
                    {consultOption?.title}
                  </Text>
                </View>
              </View>
              {selectedDate && selectedSlot && (
                <View style={styles.slotRow}>
                  <Icon
                    name="clock-outline"
                    size={14}
                    color={colors.brandPrimary}
                  />
                  <Text style={styles.slotText}>
                    {formatShortSlot(selectedDate, selectedSlot)}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={styles.submitText}>
                    {mode === 'signin' ? 'Sign in & continue' : 'Register & continue'}
                  </Text>
                  <Icon name="arrow-right" size={18} color={colors.white} />
                </>
              )}
            </TouchableOpacity>
          </KeyboardAwareScrollView>
        </View>
      </KeyboardAvoidingContainer>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(12,26,46,0.45)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral300,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 1,
    padding: spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.inkHeadline,
    paddingRight: spacing.xxxl,
  },
  subtitle: {
    fontSize: 13,
    color: colors.neutral500,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    alignItems: 'center',
  },
  tabActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandLight,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral600,
  },
  tabTextActive: {
    color: colors.brandPrimary,
  },
  field: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkHeadline,
    marginBottom: spacing.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.inkHeadline,
    backgroundColor: colors.white,
  },
  summary: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral500,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  summaryLocation: {
    fontSize: 11,
    color: colors.neutral500,
    marginTop: 2,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  slotText: {
    fontSize: 12,
    color: colors.neutral600,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    marginBottom: spacing.lg,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});