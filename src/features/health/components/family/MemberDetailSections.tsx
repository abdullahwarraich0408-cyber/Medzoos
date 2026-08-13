import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, cardStyles } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type QuickAction = {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
};

type SectionRow = {
  label: string;
  value: string;
  icon?: string;
  onPress?: () => void;
};

type MemberDetailSectionsProps = {
  todayStatus: string;
  medicineCount: number;
  reportCount: number;
  appointmentText: string;
  quickActions: QuickAction[];
  recordLinks: SectionRow[];
  onMedicinesPress: () => void;
  onReportsPress: () => void;
  onAppointmentsPress: () => void;
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function InfoRow({ label, value, icon, onPress }: SectionRow) {
  const content = (
    <>
      {icon ? (
        <View style={styles.rowIcon}>
          <Icon name={icon} size={18} color={colors.brandPrimary} />
        </View>
      ) : null}
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      {onPress ? (
        <Icon name="chevron-right" size={20} color={colors.neutral500} />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable style={styles.row} onPress={onPress}>
        {content}
      </Pressable>
    );
  }
  return <View style={styles.row}>{content}</View>;
}

export function MemberDetailSections({
  todayStatus,
  medicineCount,
  reportCount,
  appointmentText,
  quickActions,
  recordLinks,
  onMedicinesPress,
  onReportsPress,
  onAppointmentsPress,
}: MemberDetailSectionsProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.quickRow}>
        {quickActions.map(action => (
          <Pressable key={action.id} style={styles.quickBtn} onPress={action.onPress}>
            <View style={styles.quickIcon}>
              <Icon name={action.icon} size={18} color={colors.brandPrimary} />
            </View>
            <Text style={styles.quickLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionCard title="Today">
        <Text style={styles.todayText}>{todayStatus}</Text>
      </SectionCard>

      <SectionCard title="Medicines">
        <InfoRow
          label="Active medicines"
          value={
            medicineCount > 0
              ? `${medicineCount} active medicine${medicineCount === 1 ? '' : 's'}`
              : 'No active medicines'
          }
          icon="pill"
          onPress={onMedicinesPress}
        />
      </SectionCard>

      <SectionCard title="Reports">
        <InfoRow
          label="Lab reports"
          value={
            reportCount > 0
              ? `${reportCount} report${reportCount === 1 ? '' : 's'} ready`
              : 'No reports yet'
          }
          icon="flask-outline"
          onPress={onReportsPress}
        />
      </SectionCard>

      <SectionCard title="Appointments">
        <InfoRow
          label="Upcoming visits"
          value={appointmentText}
          icon="calendar-clock"
          onPress={onAppointmentsPress}
        />
      </SectionCard>

      <SectionCard title="Records">
        {recordLinks.map(link => (
          <InfoRow key={link.label} {...link} />
        ))}
      </SectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickBtn: {
    flex: 1,
    ...cardStyles.premiumSoft,
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.xs,
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink900,
    textAlign: 'center',
  },
  section: { gap: spacing.sm },
  sectionTitle: {
    ...healthOsTypography.sectionTitle,
    fontSize: 15,
  },
  card: {
    ...cardStyles.premiumSoft,
    padding: spacing.md,
    gap: spacing.xs,
  },
  todayText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral200,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: { flex: 1 },
  rowLabel: {
    fontSize: 12,
    color: colors.neutral500,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink900,
    marginTop: 2,
  },
});
