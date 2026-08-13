import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useAuth } from '../../../lib/auth/AuthContext';
import { navigateToSignIn } from '../../../lib/auth/navigation';
import {
  clearLabCart,
  getLabCart,
  groupCartByLab,
  removeFromLabCart,
} from '../../../lib/labCart';
import {
  useCreateLabOrder,
  useLabTestTimeSlots,
} from '../../../lib/hooks/useApi';
import type { LabTest } from '../../../lib/mappers/labTest';
import type { LabTestsStackParamList } from '../../../navigation/types';

import { useLocationContext } from '../../../lib/location/LocationContext';
import type { DetectedLocation } from '../../../lib/location/types';
import { UseLocationButton } from '../../../components/location/UseLocationButton';
import { TIME_SLOTS } from '../data/mockLabTests';
import { ReadPrescriptionSection } from '../components/ReadPrescriptionSection';

export function LabCartScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<LabTestsStackParamList>>();
  const { user, isAuthenticated } = useAuth();
  const { location: savedCity, detectedAddress } = useLocationContext();
  const createOrder = useCreateLabOrder();
  const { data: apiTimeSlots = [] } = useLabTestTimeSlots();
  const timeSlots = apiTimeSlots.length > 0 ? apiTimeSlots : TIME_SLOTS;

  const [cart, setCart] = useState<LabTest[]>([]);
  const [patient, setPatient] = useState({
    name: user?.name || '',
    gender: '',
    age: '',
    phone: user?.phone || '',
  });
  const [address, setAddress] = useState({
    line: detectedAddress?.street || '',
    city: detectedAddress?.city || savedCity || 'Karachi',
    phone: user?.phone || '',
  });
  const [collectionType, setCollectionType] = useState<'HOME' | 'VISIT_LAB'>(
    'HOME',
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [collectionDate, setCollectionDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [prescriptionUrl, setPrescriptionUrl] = useState('');

  const loadCart = useCallback(async () => {
    setCart(await getLabCart());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart]),
  );

  const groups = groupCartByLab(cart);
  const total = cart.reduce((sum, t) => sum + (t.price || 0), 0);
  const hasFasting = cart.some(t => t.fastingRequired);

  const handleRemove = async (testId: string) => {
    const next = await removeFromLabCart(testId);
    setCart(next);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      Alert.alert('Sign in required', 'Please sign in to place a lab order.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => navigateToSignIn(navigation) },
      ]);
      return;
    }
    if (!cart.length || !selectedSlot || !patient.name.trim() || !patient.phone.trim()) {
      Alert.alert('Missing details', 'Please complete all required fields.');
      return;
    }
    if (collectionType === 'HOME' && !address.line.trim()) {
      Alert.alert('Address required', 'Home collection address is required.');
      return;
    }

    try {
      await createOrder.mutateAsync({
        lab_test_ids: cart.map(t => t.id),
        patient_name: patient.name.trim(),
        patient_gender: patient.gender || undefined,
        patient_age: patient.age ? Number(patient.age) : undefined,
        collection_type: collectionType,
        collection_address:
          collectionType === 'HOME'
            ? { ...address, phone: patient.phone.trim() }
            : undefined,
        collection_date: new Date(collectionDate).toISOString(),
        time_slot: selectedSlot,
        payment_method: 'cod',
        prescription_url: prescriptionUrl || undefined,
      });
      await clearLabCart();
      setCart([]);
      Alert.alert('Order placed', 'Your lab order was placed successfully.', [
        {
          text: 'View Reports',
          onPress: () => navigation.navigate('LabReports'),
        },
        { text: 'OK', onPress: () => navigation.navigate('LabTestsList') },
      ]);
    } catch (error) {
      Alert.alert(
        'Checkout failed',
        error instanceof Error ? error.message : 'Could not place order.',
      );
    }
  };

  return (
    <ScreenLayout headerMode="stack" title="Lab Cart" showSearch={false}>
      {!cart.length ? (
        <View style={styles.empty}>
          <Icon name="cart-outline" size={56} color={colors.neutral300} />
          <Text style={styles.emptyTitle}>Your lab cart is empty</Text>
          <Text style={styles.emptySub}>Browse tests and add them to cart.</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate('LabTestsList')}
            activeOpacity={0.85}>
            <Text style={styles.browseBtnText}>Browse Lab Tests</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, spacing.xl) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {groups.map(group => (
            <View
              key={group.labPartnerId || group.lab}
              style={styles.groupCard}>
              <Text style={styles.groupTitle}>{group.lab}</Text>
              {group.tests.map(test => (
                <View key={test.id} style={styles.cartRow}>
                  <Text style={styles.cartName} numberOfLines={2}>
                    {test.name}
                  </Text>
                  <View style={styles.cartRight}>
                    <Text style={styles.cartPrice}>
                      PKR {test.price.toLocaleString()}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemove(test.id)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}

          <View style={styles.checkoutCard}>
            <Text style={styles.sectionTitle}>Patient details</Text>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={colors.neutral500}
              value={patient.name}
              onChangeText={v => setPatient(p => ({ ...p, name: v }))}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.half]}
                placeholder="Gender"
                placeholderTextColor={colors.neutral500}
                value={patient.gender}
                onChangeText={v => setPatient(p => ({ ...p, gender: v }))}
              />
              <TextInput
                style={[styles.input, styles.half]}
                placeholder="Age"
                placeholderTextColor={colors.neutral500}
                keyboardType="number-pad"
                value={patient.age}
                onChangeText={v => setPatient(p => ({ ...p, age: v }))}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Phone"
              placeholderTextColor={colors.neutral500}
              keyboardType="phone-pad"
              value={patient.phone}
              onChangeText={v => setPatient(p => ({ ...p, phone: v }))}
            />

            <Text style={[styles.sectionTitle, styles.sectionGap]}>
              Collection
            </Text>
            <View style={styles.typeRow}>
              {(['HOME', 'VISIT_LAB'] as const).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeBtn,
                    collectionType === type && styles.typeBtnActive,
                  ]}
                  onPress={() => setCollectionType(type)}
                  activeOpacity={0.85}>
                  <Text
                    style={[
                      styles.typeText,
                      collectionType === type && styles.typeTextActive,
                    ]}>
                    {type === 'HOME' ? 'Home Collection' : 'Visit Lab'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {collectionType === 'HOME' && (
              <>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Street address"
                  placeholderTextColor={colors.neutral500}
                  multiline
                  value={address.line}
                  onChangeText={v => setAddress(a => ({ ...a, line: v }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  placeholderTextColor={colors.neutral500}
                  value={address.city}
                  onChangeText={v => setAddress(a => ({ ...a, city: v }))}
                />
                <UseLocationButton
                  onLocationDetected={(loc: DetectedLocation) =>
                    setAddress(a => ({
                      ...a,
                      line: loc.street || a.line,
                      city: loc.city || a.city,
                    }))
                  }
                  style={styles.locationBtn}
                />
              </>
            )}

            <TextInput
              style={styles.input}
              placeholder="Collection date (YYYY-MM-DD)"
              placeholderTextColor={colors.neutral500}
              value={collectionDate}
              onChangeText={setCollectionDate}
            />

            <View style={styles.slotsGrid}>
              {timeSlots.map(slot => (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.slotBtn,
                    selectedSlot === slot && styles.slotBtnActive,
                  ]}
                  onPress={() => setSelectedSlot(slot)}
                  activeOpacity={0.85}>
                  <Text
                    style={[
                      styles.slotText,
                      selectedSlot === slot && styles.slotTextActive,
                    ]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ReadPrescriptionSection
              prescriptionUrl={prescriptionUrl}
              onPrescriptionUrlChange={setPrescriptionUrl}
              onSignInRequired={() => navigateToSignIn(navigation)}
            />

            {hasFasting && (
              <View style={styles.fastingNote}>
                <Text style={styles.fastingText}>
                  One or more tests require fasting. Please follow preparation
                  instructions.
                </Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>PKR {total.toLocaleString()}</Text>
            </View>
            <Text style={styles.codNote}>
              Pay on collection — no online payment required.
            </Text>

            <TouchableOpacity
              style={[
                styles.checkoutBtn,
                createOrder.isPending && styles.checkoutBtnDisabled,
              ]}
              onPress={handleCheckout}
              disabled={createOrder.isPending}
              activeOpacity={0.85}>
              {createOrder.isPending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.checkoutBtnText}>Place Lab Order</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  headerSpacer: { width: 40 },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.surfaceSubtle,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginTop: spacing.lg,
  },
  emptySub: {
    fontSize: 14,
    color: colors.neutral500,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  browseBtn: {
    paddingHorizontal: spacing.xl,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  groupCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.sm,
  },
  cartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
    gap: spacing.md,
  },
  cartName: {
    flex: 1,
    fontSize: 14,
    color: colors.inkHeadline,
  },
  cartRight: { alignItems: 'flex-end', gap: 4 },
  cartPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  removeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.statusDanger,
  },
  checkoutCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.sm,
  },
  sectionGap: { marginTop: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.inkHeadline,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  locationBtn: { marginBottom: spacing.sm },
  textArea: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  typeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    alignItems: 'center',
  },
  typeBtnActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandLight,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral600,
  },
  typeTextActive: { color: colors.brandPrimary },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  slotBtn: {
    width: '48%',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    alignItems: 'center',
  },
  slotBtnActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandLight,
  },
  slotText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral800,
  },
  slotTextActive: { color: colors.brandPrimary },
  fastingNote: {
    backgroundColor: '#FEF3C7',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  fastingText: { fontSize: 12, color: '#92400E' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
    marginBottom: spacing.xs,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
  codNote: {
    fontSize: 12,
    color: colors.neutral500,
    marginBottom: spacing.lg,
  },
  checkoutBtn: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnDisabled: { opacity: 0.7 },
  checkoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});