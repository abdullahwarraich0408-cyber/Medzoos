import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RECORD_SOURCE_META, type MedicalRecordSource } from '../../lib/medicalRecords';
import { colors, spacing, radius } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

const SOURCES: MedicalRecordSource[] = ['lab', 'doctor', 'pharmacy', 'manual'];

export function RecordSourceLegend() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Records come from</Text>
      <View style={styles.row}>
        {SOURCES.map(source => {
          const meta = RECORD_SOURCE_META[source];
          return (
            <View key={source} style={styles.chip}>
              <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
                <Icon name={meta.icon} size={14} color={meta.color} />
              </View>
              <Text style={styles.chipText}>{meta.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.08)',
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    ...healthOsTypography.label,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: spacing.sm,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral600,
  },
});
