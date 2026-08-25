import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { KeyboardAwareScrollView } from '../../../components/keyboard';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import { ReadPrescriptionSection } from '../../lab-tests/components/ReadPrescriptionSection';
import { UseLocationButton } from '../../../components/location/UseLocationButton';
import { navigateToSignIn } from '../../../lib/auth/navigation';
import type { PrescriptionOcrData } from '../../../lib/api';
import type { PickedPrescription } from '../../../lib/familyVault/uploadPrescription';
import {
  useCreatePrescriptionOrder,
  usePrescriptionOrders,
} from '../../../lib/hooks/useApi';
import { useLocationContext } from '../../../lib/location/LocationContext';
import type { DetectedLocation } from '../../../lib/location/types';
import type { DrawerParamList } from '../../../navigation/types';


function mapOcrMedicines(ocrData: PrescriptionOcrData | null) {
  const medicines = (ocrData?.medicines || [])
    .filter(med => med.name?.trim())
    .map(med => ({
      name: med.name!.trim(),
      quantity: 1,
      unit_price: 0,
    }));

  return medicines.length ? medicines : undefined;
}

function PrescriptionUploadContent() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const { location: savedCity, detectedAddress } = useLocationContext();
  const createOrder = useCreatePrescriptionOrder();
  const { data: orders = [], isLoading: ordersLoading } = usePrescriptionOrders();

  const [deliveryType, setDeliveryType] = useState<'express' | 'standard'>('standard');
  const [address, setAddress] = useState({
    street: detectedAddress?.street || '',
    city: detectedAddress?.city || savedCity || 'Karachi',
    province: detectedAddress?.province || 'Sindh',
  });
  const [prescriptionUrl, setPrescriptionUrl] = useState('');
  const [pickedFile, setPickedFile] = useState<PickedPrescription | null>(null);
  const [ocrData, setOcrData] = useState<PrescriptionOcrData | null>(null);

  const handleSubmit = async () => {
    if (!pickedFile) {
      Alert.alert('Prescription required', 'Please upload your prescription photo first.');
      return;
    }
    if (!address.street.trim() || !address.city.trim()) {
      Alert.alert('Address required', 'Enter your delivery street and city.');
      return;
    }

    try {
      const result = await createOrder.mutateAsync({
        file: pickedFile,
        delivery_address: {
          street: address.street.trim(),
          city: address.city.trim(),
          province: address.province.trim() || undefined,
        },
        delivery_type: deliveryType,
        medicines: mapOcrMedicines(ocrData),
      });

      Alert.alert(
        'Prescription sent',
        'Your prescription was sent to the nearest pharmacy. Track it in Orders.',
        [
          {
            text: 'View Orders',
            onPress: () =>
              navigation.navigate('MainTabs', {
                screen: 'You',
                params: { screen: 'OrdersList' },
              } as never),
          },
          { text: 'OK' },
        ],
      );

      setPrescriptionUrl('');
      setPickedFile(null);
      setOcrData(null);
      setAddress({
        street: detectedAddress?.street || '',
        city: detectedAddress?.city || savedCity || 'Karachi',
        province: detectedAddress?.province || 'Sindh',
      });
    } catch (error) {
      Alert.alert(
        'Could not submit',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <Icon name="pill" size={28} color={colors.brandPrimary} />
        <Text style={styles.heroTitle}>Upload prescription for medicines</Text>
        <Text style={styles.heroSub}>
          Send your prescription to a nearby pharmacy. We read medicines when possible and
          deliver to your door.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Delivery speed</Text>
      <View style={styles.typeRow}>
        {([
          { id: 'express' as const, label: 'Express', icon: 'lightning-bolt' },
          { id: 'standard' as const, label: 'Standard', icon: 'truck-delivery' },
        ]).map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.typeBtn,
              deliveryType === option.id && styles.typeBtnActive,
            ]}
            onPress={() => setDeliveryType(option.id)}
            activeOpacity={0.85}>
            <Icon
              name={option.icon}
              size={18}
              color={deliveryType === option.id ? colors.brandPrimary : colors.neutral500}
            />
            <Text
              style={[
                styles.typeText,
                deliveryType === option.id && styles.typeTextActive,
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Delivery address</Text>
      <TextInput
        style={styles.input}
        placeholder="Street address *"
        placeholderTextColor={colors.neutral500}
        value={address.street}
        onChangeText={v => setAddress(a => ({ ...a, street: v }))}
      />
      <TextInput
        style={styles.input}
        placeholder="City *"
        placeholderTextColor={colors.neutral500}
        value={address.city}
        onChangeText={v => setAddress(a => ({ ...a, city: v }))}
      />
      <UseLocationButton
        onLocationDetected={(loc: DetectedLocation) =>
          setAddress(a => ({
            ...a,
            street: loc.street || a.street,
            city: loc.city || a.city,
            province: loc.province || a.province,
          }))
        }
        style={styles.locationBtn}
      />

      <ReadPrescriptionSection
        label="Prescription photo *"
        hint="Upload a clear photo of your prescription. We extract medicine names to help the pharmacy prepare your order."
        submitLabel="Upload & Read Prescription"
        prescriptionUrl={prescriptionUrl}
        onPrescriptionUrlChange={setPrescriptionUrl}
        onFilePicked={setPickedFile}
        onOcrDataChange={setOcrData}
        onSignInRequired={() => navigateToSignIn(navigation)}
      />

      <TouchableOpacity
        style={[styles.submitBtn, createOrder.isPending && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={createOrder.isPending}
        activeOpacity={0.85}>
        {createOrder.isPending ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Icon name="send" size={18} color={colors.white} />
            <Text style={styles.submitText}>Submit to Pharmacy</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.ordersSection}>
        <Text style={styles.sectionTitle}>Your prescription orders</Text>
        {ordersLoading ? (
          <ActivityIndicator color={colors.brandPrimary} style={styles.ordersLoader} />
        ) : orders.length === 0 ? (
          <Text style={styles.emptyOrders}>
            No prescription orders yet. Upload a prescription above to get medicines
            delivered.
          </Text>
        ) : (
          orders.slice(0, 5).map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>{order.shortId}</Text>
                <Text style={styles.orderStatus}>{order.statusLabel}</Text>
              </View>
              <Text style={styles.orderMeta}>{order.deliveryAddress}</Text>
              <Text style={styles.orderMeta}>
                {order.medicineCount} medicine(s)
              </Text>
            </View>
          ))
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}

export function PrescriptionUploadScreen() {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <ScreenLayout headerMode="stack" title="Upload Prescription" showSearch={false}>
      <RequireAuthGate
        title="Sign in to upload prescriptions"
        subtitle="Upload your prescription and get medicines delivered from a nearby pharmacy."
        icon="file-document-outline">
        <PrescriptionUploadContent />
      </RequireAuthGate>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg, gap: spacing.sm },
  hero: {
    backgroundColor: colors.brandLight,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.inkHeadline,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 13,
    color: colors.neutral600,
    textAlign: 'center',
    lineHeight: 19,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    backgroundColor: colors.white,
  },
  typeBtnActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandLight,
  },
  typeText: { fontSize: 13, fontWeight: '600', color: colors.neutral600 },
  typeTextActive: { color: colors.brandPrimary },
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
  locationBtn: { marginBottom: spacing.md },
  submitBtn: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { fontSize: 15, fontWeight: '700', color: colors.white },
  ordersSection: { gap: spacing.sm },
  ordersLoader: { marginVertical: spacing.lg },
  emptyOrders: {
    fontSize: 13,
    color: colors.neutral500,
    lineHeight: 19,
    paddingVertical: spacing.md,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  orderId: { fontSize: 14, fontWeight: '700', color: colors.inkHeadline },
  orderStatus: { fontSize: 12, fontWeight: '600', color: colors.brandPrimary },
  orderMeta: { fontSize: 12, color: colors.neutral600, lineHeight: 17 },
});