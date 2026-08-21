import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../theme';
import { specialtyVisual } from '../../home/data/homeData';

const CARD_W = Dimensions.get('window').width * 0.72;

export type HomeRecentVisit = {
  id: string;
  name: string;
  specialty: string;
  image?: string;
  dateLabel: string;
  modeLabel: string;
};

type HomeRecentVisitsProps = {
  visits: HomeRecentVisit[];
  onSeeAll: () => void;
  onVisitPress: (id: string) => void;
  onEmptyCta?: () => void;
};

export function HomeRecentVisits({
  visits,
  onSeeAll,
  onVisitPress,
  onEmptyCta,
}: HomeRecentVisitsProps) {
  if (visits.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={styles.title}>My Recent Visit</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.emptyCard, pressed && styles.pressed]}
          onPress={onEmptyCta ?? onSeeAll}>
          <View style={styles.emptyIcon}>
            <Icon name="stethoscope" size={26} color={colors.primary700} />
          </View>
          <View style={styles.emptyCopy}>
            <Text style={styles.emptyTitle}>No visits yet</Text>
            <Text style={styles.emptyHint}>
              Book your first doctor visit and it will show up here.
            </Text>
          </View>
          <View style={styles.emptyCta}>
            <Text style={styles.emptyCtaText}>Find a doctor</Text>
            <Icon name="arrow-right" size={16} color={colors.primary700} />
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>My Recent Visit</Text>
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_W + spacing.md}
        contentContainerStyle={styles.row}>
        {visits.map(visit => {
          const visual = specialtyVisual(visit.specialty);
          return (
            <Pressable
              key={visit.id}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              onPress={() => onVisitPress(visit.id)}>
              <View style={styles.pill}>
                <View style={styles.pillIcon}>
                  <Icon
                    name={visual.icon}
                    size={16}
                    color={colors.iconPrimary}
                  />
                </View>
                <View style={styles.pillCopy}>
                  <Text style={styles.specName} numberOfLines={1}>
                    {visit.specialty || 'Consultation'}
                  </Text>
                  <Text style={styles.specMeta} numberOfLines={1}>
                    {visit.modeLabel}
                  </Text>
                </View>
                {visit.image ? (
                  <Image source={{ uri: visit.image }} style={styles.photo} />
                ) : (
                  <View style={[styles.photo, styles.photoFallback]}>
                    <Icon name="doctor" size={20} color={colors.primary700} />
                  </View>
                )}
              </View>

              <Text style={styles.doctorName} numberOfLines={1}>
                {visit.name}
              </Text>

              <View style={styles.bottomRow}>
                <Text style={styles.dateLabel}>{visit.dateLabel}</Text>
                <View style={styles.openBtn}>
                  <Icon name="chevron-right" size={18} color={colors.iconWhite} />
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary700,
  },
  emptyCard: {
    backgroundColor: colors.primary100,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(23, 97, 142, 0.12)',
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCopy: { gap: 4 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary900,
  },
  emptyHint: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.primary600,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  emptyCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary700,
  },
  row: {
    gap: spacing.md,
    paddingVertical: 2,
    paddingRight: spacing.lg,
  },
  card: {
    width: CARD_W,
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
    ...shadows.cardSoft,
  },
  pressed: {
    opacity: 0.96,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary100,
    borderRadius: radius.lg,
    padding: spacing.sm,
  },
  pillIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  specName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary600,
  },
  specMeta: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
  },
  photo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary100,
    borderWidth: 2,
    borderColor: colors.white,
  },
  photoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    flex: 1,
  },
  openBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primary700,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
