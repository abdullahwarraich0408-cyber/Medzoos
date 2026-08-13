import { colors, spacing, radius } from '../../../../theme';
import { healthOs } from '../../../../theme/healthOs';
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

function formatTiming(
  item: SavedMedicine | OcrMedicine,
): string {
  if ('morning' in item || 'afternoon' in item || 'night' in item) {
    const parts = [
      item.morning && 'Morning',
      item.afternoon && 'Afternoon',
      item.night && 'Night',
    ].filter(Boolean);
    if (parts.length) return parts.join(', ');
  }
  if (Array.isArray(item.frequency) && item.frequency.length) {
    return item.frequency
      .map(f => f.charAt(0).toUpperCase() + f.slice(1))
      .join(', ');
  }
  return 'Timing not specified';
}

export function MedicineRow({
  name,
  dose,
  timing,
  purpose,
  purposeSource,
  instructions,
  duration,
  doctor,
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
  return (
    <View style={styles.medRow}>
      <Icon name="pill" size={16} color={colors.brandPrimary} />
      <View style={styles.medBody}>
        <Text style={styles.medName}>{name}</Text>
        {dose ? <Text style={styles.medMeta}>Dose: {dose}</Text> : null}
        {purpose ? (
          <Text style={styles.medPurpose}>
            For: {purpose}
            {purposeSource === 'inferred' ? ' (from diagnosis)' : ''}
          </Text>
        ) : null}
        <Text style={styles.medMeta}>{timing}</Text>
        {duration ? <Text style={styles.medMeta}>Duration: {duration}</Text> : null}
        {instructions ? <Text style={styles.medMeta}>{instructions}</Text> : null}
        {doctor ? <Text style={styles.medMeta}>Dr. {doctor}</Text> : null}
      </View>
    </View>
  );
}

export function ExtractedMedicinesBlock({
  medicines,
  doctor,
  label = 'Extracted medicines',
}: {
  medicines: OcrMedicine[];
  doctor?: string | null;
  label?: string;
}) {
  if (!medicines?.length) return null;

  return (
    <View style={styles.extractedWrap}>
      <Text style={styles.extractedLabel}>{label}</Text>
      {medicines.map((med, index) => (
        <MedicineRow
          key={`${med.name}-${index}`}
          name={med.name || 'Unknown medicine'}
          dose={med.dose}
          timing={formatTiming(med)}
          purpose={med.purpose}
          purposeSource={med.purpose_source}
          instructions={med.instructions}
          duration={med.duration}
          doctor={doctor}
        />
      ))}
    </View>
  );
}

export function SavedMedicinesList({ medicines }: { medicines: SavedMedicine[] }) {
  if (!medicines.length) {
    return (
      <Text style={styles.empty}>
        No medicines saved yet. Upload a prescription or add manually on the website.
      </Text>
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
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral200,
    gap: spacing.sm,
  },
  extractedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brandPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  medRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  medBody: { flex: 1, gap: 2 },
  medName: { fontSize: 14, fontWeight: '700', color: colors.inkHeadline },
  medPurpose: { fontSize: 12, fontWeight: '600', color: colors.brandDark, lineHeight: 16 },
  medMeta: { fontSize: 12, color: colors.neutral600, lineHeight: 16 },
  list: { gap: spacing.sm },
  savedCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.md,
  },
  empty: {
    fontSize: 14,
    color: colors.neutral500,
    textAlign: 'center',
    lineHeight: 20,
    paddingVertical: spacing.lg,
  },
});