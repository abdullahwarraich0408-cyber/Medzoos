import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import type { HealthStackParamList } from '../../../navigation/types';
import {
  getMedicineById,
  getPrescriptionById,
  getSourceLabel,
  getRefillLabel,
} from '../data/medicineModel';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';

type Route = RouteProp<HealthStackParamList, 'MedicineDetail'>;
type Nav = NativeStackNavigationProp<HealthStackParamList>;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function MedicineDetailContent() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const medicine = useMemo(
    () => getMedicineById([], route.params.medicineId),
    [route.params.medicineId],
  );

  const linkedPrescription = useMemo(() => {
    if (!medicine?.prescriptionId) return null;
    return getPrescriptionById([], medicine.prescriptionId);
  }, [medicine?.prescriptionId]);

  if (!medicine) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Medicine not found.</Text>
      </View>
    );
  }

  const needsRefill = getRefillLabel(medicine) !== 'No refill needed';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom:
            Math.max(insets.bottom, TAB_BAR_CLEARANCE) + spacing.lg,
        },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Icon name="pill" size={24} color={colors.primary700} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>{medicine.medicineName}</Text>
          <Text style={styles.heroMeta}>
            {[medicine.genericName, getSourceLabel(medicine)]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <DetailRow label="Strength" value={medicine.strength} />
        <View style={styles.divider} />
        <DetailRow label="Dosage" value={medicine.dosage} />
        <View style={styles.divider} />
        <DetailRow label="Timing" value={medicine.timing} />
        <View style={styles.divider} />
        <DetailRow label="Frequency" value={medicine.frequency} />
        <View style={styles.divider} />
        <DetailRow label="Instructions" value={medicine.instructions} />
        <View style={styles.divider} />
        <DetailRow label="Refill" value={getRefillLabel(medicine)} />
      </View>

      {linkedPrescription ? (
        <Pressable
          style={({ pressed }) => [styles.linkRow, pressed && styles.linkPressed]}
          onPress={() =>
            navigation.navigate('PrescriptionDetail', {
              prescriptionId: linkedPrescription.prescriptionId,
            })
          }>
          <Icon name="file-document-outline" size={18} color={colors.primary700} />
          <Text style={styles.linkText} numberOfLines={1}>
            Linked prescription
          </Text>
          <Icon name="chevron-right" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}

      <View style={styles.actions}>
        {needsRefill ? (
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.primaryBtnText}>Refill medicine</Text>
          </Pressable>
        ) : null}
        <Pressable
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && styles.linkPressed,
          ]}
          onPress={() =>
            Alert.alert('Reminders', 'Reminder settings coming soon.')
          }>
          <Text style={styles.secondaryBtnText}>Reminder settings</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

export function MedicineDetailScreen() {
  const route = useRoute<Route>();
  const medicine = getMedicineById([], route.params.medicineId);

  return (
    <ScreenLayout
      headerMode="stack"
      title={medicine?.medicineName || 'Medicine'}
      showSearch={false}
      showCart>
      <MedicineDetailContent />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: {
    padding: calmLayout.screenPadding,
    gap: 20,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: { flex: 1, gap: 4, minWidth: 0 },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary900,
    letterSpacing: -0.3,
  },
  heroMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  detailRow: {
    paddingVertical: spacing.md,
    gap: 4,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    lineHeight: 21,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  linkPressed: { backgroundColor: colors.primary100 },
  linkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actions: { gap: spacing.sm, marginTop: spacing.xs },
  primaryBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.primary700,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary700,
  },
  btnPressed: { opacity: 0.9 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 15, color: colors.textMuted },
});
