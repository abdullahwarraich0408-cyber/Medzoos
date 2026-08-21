import { colors, spacing, radius } from '../../../../theme';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type OcrMedicine = {
  name?: string;
  dose?: string;
  frequency?: string[];
  instructions?: string;
  duration?: string;
  purpose?: string | null;
  purpose_source?: 'prescription' | 'inferred' | 'unknown';
};

type SavedMedicine = {
  id?: string;
  name: string;
  dose?: string | null;
  morning?: boolean;
  afternoon?: boolean;
  night?: boolean;
  instructions?: string | null;
  purpose?: string | null;
  prescribing_doctor?: string | null;
};

function formatTiming(item: SavedMedicine | OcrMedicine): string {
  if ('morning' in item || 'afternoon' in item || 'night' in item) {
    const parts = [
      item.morning && 'Morning',
      item.afternoon && 'Afternoon',
      item.night && 'Night',
    ].filter(Boolean);
    if (parts.length) return parts.join(', ');
  }
  if ('frequency' in item && Array.isArray(item.frequency) && item.frequency.length) {
    return item.frequency
      .map((f: string) => (typeof f === 'string' ? f.charAt(0).toUpperCase() + f.slice(1) : String(f)))
      .join(', ');
  }
  return '';
}

export function MedicineRow({
  name,
  dose,
  timing,
  purpose,
}: {
  name: string;
  dose?: string | null;
  timing: string;
  purpose?: string | null;
  purposeSource?: string | null;
  instructions?: string | null;
  duration?: string | null;
  doctor?: string | null;
}) {
  const meta = [dose, timing, purpose ? `For ${purpose}` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.medRow}>
      <View style={styles.iconWrap}>
        <Icon name="pill" size={16} color={colors.primary700} />
      </View>
      <View style={styles.medBody}>
        <Text style={styles.medName} numberOfLines={1}>
          {name}
        </Text>
        {meta ? (
          <Text style={styles.medMeta} numberOfLines={2}>
            {meta}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function ExtractedMedicinesBlock({
  medicines,
  doctor,
}: {
  medicines: OcrMedicine[];
  doctor?: string | null;
  label?: string;
}) {
  if (!medicines?.length) return null;

  return (
    <View style={styles.extractedWrap}>
      {medicines.map((med, index) => (
        <MedicineRow
          key={`${med.name}-${index}`}
          name={med.name || 'Unknown medicine'}
          dose={med.dose}
          timing={formatTiming(med)}
          purpose={med.purpose}
          doctor={doctor}
        />
      ))}
    </View>
  );
}

export function SavedMedicinesList({ medicines }: { medicines: SavedMedicine[] }) {
  if (!medicines.length) {
    return (
      <Text style={styles.empty}>No medicines saved for this member yet.</Text>
    );
  }

  return (
    <View style={styles.list}>
      {medicines.map(med => (
        <View key={med.id || med.name} style={styles.savedCard}>
          <MedicineRow
            name={med.name}
            dose={med.dose}
            timing={formatTiming(med)}
            purpose={med.purpose}
            instructions={med.instructions}
            doctor={med.prescribing_doctor}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  extractedWrap: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medBody: { flex: 1, gap: 2, minWidth: 0 },
  medName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  medMeta: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  list: { gap: spacing.sm },
  savedCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  empty: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    paddingVertical: spacing.xl,
  },
});
