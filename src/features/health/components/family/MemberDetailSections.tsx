import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius } from '../../../../theme';

export type MemberPanelId = 'medicines' | 'reports' | 'appointments' | 'vitals';

type MemberPanelTabsProps = {
  active: MemberPanelId;
  onChange: (id: MemberPanelId) => void;
  counts?: {
    medicines?: number;
    reports?: number;
  };
};

const TABS: { id: MemberPanelId; label: string }[] = [
  { id: 'medicines', label: 'Meds' },
  { id: 'reports', label: 'Rx' },
  { id: 'appointments', label: 'Visits' },
  { id: 'vitals', label: 'Vitals' },
];

export function MemberPanelTabs({ active, onChange }: MemberPanelTabsProps) {
  return (
    <View style={styles.wrap}>
      {TABS.map(tab => {
        const isActive = active === tab.id;
        return (
          <Pressable
            key={tab.id}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab.id)}>
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type MemberHeroProps = {
  name: string;
  relationship: string;
  bloodGroup?: string | null;
  dobLabel?: string | null;
  healthScore?: number | null;
};

export function MemberHero({
  name,
  relationship,
  bloodGroup,
  dobLabel,
  healthScore,
}: MemberHeroProps) {
  const initials = name
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const meta = [relationship, bloodGroup, dobLabel].filter(Boolean).join(' · ');

  return (
    <View style={styles.hero}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.heroCopy}>
        <Text style={styles.heroName} numberOfLines={1}>
          {name}
        </Text>
        {meta ? (
          <Text style={styles.heroMeta} numberOfLines={2}>
            {meta}
          </Text>
        ) : null}
      </View>
      {healthScore != null ? (
        <View style={styles.scoreRing}>
          <Text style={styles.scoreValue}>{healthScore}</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>
      ) : null}
    </View>
  );
}

type QuickLinkProps = {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export function MemberQuickLink({
  icon,
  title,
  subtitle,
  onPress,
}: QuickLinkProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.linkRow, pressed && styles.linkPressed]}
      onPress={onPress}>
      <View style={styles.linkIcon}>
        <Icon name={icon} size={18} color={colors.primary700} />
      </View>
      <View style={styles.linkCopy}>
        <Text style={styles.linkTitle}>{title}</Text>
        <Text style={styles.linkSub} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Icon name="chevron-right" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

/** @deprecated Prefer MemberHero + MemberPanelTabs */
export function MemberDetailSections() {
  return null;
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 4,
    gap: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
  },
  tabActive: {
    backgroundColor: colors.primary100,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary800,
    fontWeight: '700',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary100,
    borderRadius: radius.xxl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(23, 97, 142, 0.12)',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary800,
  },
  heroCopy: { flex: 1, gap: 4, minWidth: 0 },
  heroName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary900,
    letterSpacing: -0.2,
  },
  heroMeta: {
    fontSize: 12,
    color: colors.primary600,
    lineHeight: 17,
  },
  scoreRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary800,
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
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
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkCopy: { flex: 1, gap: 2, minWidth: 0 },
  linkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  linkSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
