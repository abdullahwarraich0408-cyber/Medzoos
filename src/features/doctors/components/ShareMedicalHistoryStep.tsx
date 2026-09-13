import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { medicalHistoryApi } from '../../../lib/api';
import { colors, spacing, radius } from '../../../theme';

function grantKey(type: string, id: string) {
  return `${type}:${id}`;
}

function formatDate(value?: unknown) {
  if (!value) return '';
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

type ShareItem = {
  key: string;
  title: string;
  subtitle?: string;
  meta?: string;
  grant: { record_type: string; record_id: string };
};

type Props = {
  doctorName?: string;
  selectedKeys: string[];
  onChangeSelectedKeys: (keys: string[]) => void;
  onBack: () => void;
  onSkip: () => void;
  onShareAndContinue: () => void;
  isSubmitting?: boolean;
};

export function ShareMedicalHistoryStep({
  doctorName,
  selectedKeys,
  onChangeSelectedKeys,
  onBack,
  onSkip,
  onShareAndContinue,
  isSubmitting,
}: Props) {
  const query = useQuery({
    queryKey: ['shareable-medical-history'],
    queryFn: () => medicalHistoryApi.listShareable(),
  });

  const data = query.data || {};
  const sections = useMemo(() => {
    const mapItems = (
      items: Array<Record<string, unknown>> | undefined,
      fallbackTitle: string,
    ): ShareItem[] =>
      (items || []).map(item => {
        const type = String(item.record_type || 'document');
        const id = String(item.record_id || item.id || '');
        return {
          key: grantKey(type, id),
          title: String(item.title || item.name || fallbackTitle),
          subtitle: String(item.summary || item.description || ''),
          meta: formatDate(item.date || item.created_at),
          grant: { record_type: type, record_id: id },
        };
      });

    return [
      {
        key: 'visit_summaries',
        title: 'Visit summaries',
        items: mapItems(data.visit_summaries, 'Visit summary'),
      },
      {
        key: 'prescriptions',
        title: 'Prescriptions',
        items: mapItems(data.prescriptions, 'Prescription'),
      },
      {
        key: 'lab_reports',
        title: 'Lab reports',
        items: mapItems(data.lab_reports, 'Lab report'),
      },
      {
        key: 'medical_documents',
        title: 'Medical documents',
        items: mapItems(data.medical_documents, 'Document'),
      },
      {
        key: 'visit_documents',
        title: 'Visit documents',
        items: mapItems(data.visit_documents, 'Visit document'),
      },
    ].filter(section => section.items.length > 0);
  }, [data]);

  const toggle = (key: string) => {
    if (selectedKeys.includes(key)) {
      onChangeSelectedKeys(selectedKeys.filter(k => k !== key));
    } else {
      onChangeSelectedKeys([...selectedKeys, key]);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Share medical history?</Text>
      <Text style={styles.subtitle}>
        Optionally share records with{' '}
        {doctorName ? `Dr. ${doctorName.replace(/^Dr\.?\s*/i, '')}` : 'your doctor'}{' '}
        for this visit only.
      </Text>

      {query.isLoading ? (
        <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: 20 }} />
      ) : sections.length === 0 ? (
        <Text style={styles.empty}>
          No shareable records yet. You can continue without sharing.
        </Text>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {sections.map(section => (
            <View key={section.key} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map(item => {
                const checked = selectedKeys.includes(item.key);
                return (
                  <Pressable
                    key={item.key}
                    style={[styles.row, checked && styles.rowActive]}
                    onPress={() => toggle(item.key)}>
                    <View
                      style={[styles.check, checked && styles.checkActive]}>
                      {checked ? (
                        <Text style={styles.checkMark}>✓</Text>
                      ) : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      {item.subtitle ? (
                        <Text style={styles.itemSub} numberOfLines={2}>
                          {item.subtitle}
                        </Text>
                      ) : null}
                      {item.meta ? (
                        <Text style={styles.itemMeta}>{item.meta}</Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.actions}>
        <Pressable style={styles.secondaryBtn} onPress={onBack}>
          <Text style={styles.secondaryBtnText}>Back</Text>
        </Pressable>
        <Pressable style={styles.ghostBtn} onPress={onSkip} disabled={isSubmitting}>
          <Text style={styles.ghostBtnText}>Skip</Text>
        </Pressable>
        <Pressable
          style={[styles.primaryBtn, isSubmitting && { opacity: 0.7 }]}
          onPress={onShareAndContinue}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.primaryBtnText}>
              {selectedKeys.length ? 'Share & continue' : 'Continue'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export function selectedKeysToGrants(
  selectedKeys: string[],
  shareable: Awaited<ReturnType<typeof medicalHistoryApi.listShareable>> | undefined,
) {
  const all = [
    ...(shareable?.visit_summaries || []),
    ...(shareable?.prescriptions || []),
    ...(shareable?.lab_reports || []),
    ...(shareable?.medical_documents || []),
    ...(shareable?.visit_documents || []),
  ];
  return selectedKeys
    .map(key => {
      const [record_type, ...rest] = key.split(':');
      const record_id = rest.join(':');
      const found = all.find(
        item =>
          String(item.record_type) === record_type &&
          String(item.record_id || item.id) === record_id,
      );
      if (!found && record_type && record_id) {
        return { record_type, record_id };
      }
      if (!found) return null;
      return {
        record_type: String(found.record_type),
        record_id: String(found.record_id || found.id),
      };
    })
    .filter(Boolean) as Array<{ record_type: string; record_id: string }>;
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md, flex: 1 },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  empty: { fontSize: 13, color: colors.textMuted, marginTop: spacing.md },
  list: { maxHeight: 360 },
  section: { marginBottom: spacing.md, gap: spacing.sm },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  rowActive: { borderColor: colors.brandPrimary },
  check: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.neutral300,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  checkMark: { color: colors.white, fontSize: 12, fontWeight: '700' },
  itemTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  itemSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  itemMeta: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  actions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  secondaryBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  secondaryBtnText: { fontWeight: '700', color: colors.textMuted },
  ghostBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  ghostBtnText: { fontWeight: '700', color: colors.brandPrimary },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
});
