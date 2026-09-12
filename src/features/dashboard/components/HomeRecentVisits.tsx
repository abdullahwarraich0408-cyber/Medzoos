import React, { type ReactNode } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing, radius } from '../../../theme';
import { specialtyVisual } from '../../home/data/homeData';
import { homeBrand } from '../homeBrand';

const CARD_W = Dimensions.get('window').width * 0.78;
/** Matches Home page wash — required for neumorphism to read correctly */
const NEO_SURFACE = homeBrand.page;

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

/**
 * Soft extruded neumorph shell — light highlight + soft teal shadow.
 */
function NeumorphCard({
  children,
  style,
  contentStyle,
  pressed,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  pressed?: boolean;
}) {
  return (
    <View style={[styles.neoOuter, pressed && styles.neoPressed, style]}>
      <View style={[styles.neoInner, contentStyle]}>{children}</View>
    </View>
  );
}

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
          <View>
            <Text style={styles.title}>Recent visits</Text>
            <Text style={styles.sectionHint}>Your care history, in one place</Text>
          </View>
        </View>

        <Pressable
          onPress={onEmptyCta ?? onSeeAll}
          accessibilityRole="button"
          accessibilityLabel="Book your first doctor visit">
          {({ pressed }) => (
            <NeumorphCard pressed={pressed} contentStyle={styles.emptyContent}>
              <View style={styles.emptyBody}>
                <View style={styles.neoIconWell}>
                  <View style={styles.brandIcon}>
                    <Icon name="calendar-plus" size={22} color={homeBrand.onMain} />
                  </View>
                </View>
                <View style={styles.emptyCopy}>
                  <Text style={styles.emptyTitle}>No visits yet</Text>
                  <Text style={styles.emptyHint}>
                    Book a doctor and your visits will appear here for quick
                    rebooking.
                  </Text>
                </View>
              </View>

              <View style={styles.emptyCta}>
                <Text style={styles.emptyCtaText}>Find a doctor</Text>
                <Icon name="arrow-right" size={16} color={homeBrand.onMain} />
              </View>
            </NeumorphCard>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Recent visits</Text>
          <Text style={styles.sectionHint}>Tap to open appointment details</Text>
        </View>
        <Pressable onPress={onSeeAll} hitSlop={8} style={styles.seeAllBtn}>
          <Text style={styles.seeAll}>See all</Text>
          <Icon name="chevron-right" size={16} color={homeBrand.header} />
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
          const isOnline = /online/i.test(visit.modeLabel);
          return (
            <Pressable
              key={visit.id}
              onPress={() => onVisitPress(visit.id)}
              accessibilityRole="button"
              accessibilityLabel={`${visit.name}, ${visit.specialty}`}>
              {({ pressed }) => (
                <NeumorphCard
                  pressed={pressed}
                  style={{ width: CARD_W }}
                  contentStyle={styles.visitContent}>
                  <View style={styles.cardTop}>
                    {visit.image ? (
                      <Image source={{ uri: visit.image }} style={styles.photo} />
                    ) : (
                      <View style={[styles.photo, styles.photoFallback]}>
                        <Icon name="doctor" size={22} color={homeBrand.header} />
                      </View>
                    )}
                    <View style={styles.topCopy}>
                      <Text style={styles.doctorName} numberOfLines={1}>
                        {visit.name}
                      </Text>
                      <Text style={styles.specName} numberOfLines={1}>
                        {visit.specialty || 'Consultation'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaChip}>
                      <Icon
                        name={isOnline ? 'video-outline' : 'hospital-building'}
                        size={14}
                        color={homeBrand.header}
                      />
                      <Text style={styles.metaChipText} numberOfLines={1}>
                        {visit.modeLabel}
                      </Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Icon
                        name="calendar-outline"
                        size={14}
                        color={homeBrand.header}
                      />
                      <Text style={styles.metaChipText} numberOfLines={1}>
                        {visit.dateLabel}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardBottom}>
                    <View style={styles.specIcon}>
                      <Icon
                        name={visual.icon}
                        size={16}
                        color={homeBrand.header}
                      />
                    </View>
                    <Text style={styles.rebookText}>View details</Text>
                    <View style={styles.openBtn}>
                      <Icon name="arrow-right" size={16} color={homeBrand.onMain} />
                    </View>
                  </View>
                </NeumorphCard>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: homeBrand.header,
    letterSpacing: -0.2,
  },
  sectionHint: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
    color: homeBrand.muted,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 2,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: homeBrand.header,
  },

  /* ——— Neumorphism shell ——— */
  neoOuter: {
    borderRadius: 22,
    backgroundColor: NEO_SURFACE,
    ...Platform.select({
      ios: {
        shadowColor: '#7FA4AD',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  neoPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.96,
  },
  neoInner: {
    borderRadius: 22,
    overflow: 'hidden',
  },

  emptyContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  neoIconWell: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: NEO_SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderTopColor: 'rgba(255,255,255,0.95)',
    borderLeftColor: 'rgba(255,255,255,0.9)',
    borderRightColor: 'rgba(16, 85, 104, 0.1)',
    borderBottomColor: 'rgba(16, 85, 104, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#9BB8C0',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: homeBrand.header,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCopy: {
    flex: 1,
    gap: 4,
    paddingTop: 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: homeBrand.header,
    letterSpacing: -0.2,
  },
  emptyHint: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    color: homeBrand.muted,
  },
  emptyCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: homeBrand.header,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    ...Platform.select({
      ios: {
        shadowColor: homeBrand.header,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  emptyCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: homeBrand.onMain,
  },

  row: {
    gap: spacing.md,
    paddingVertical: 6,
    paddingRight: spacing.lg,
  },
  visitContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  photo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: homeBrand.soft,
  },
  photoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderTopColor: 'rgba(255,255,255,0.95)',
    borderLeftColor: 'rgba(255,255,255,0.9)',
    borderRightColor: 'rgba(16, 85, 104, 0.1)',
    borderBottomColor: 'rgba(16, 85, 104, 0.12)',
  },
  topCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: homeBrand.header,
    letterSpacing: -0.2,
  },
  specName: {
    fontSize: 13,
    fontWeight: '500',
    color: homeBrand.muted,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: NEO_SURFACE,
    borderWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.95)',
    borderLeftColor: 'rgba(255,255,255,0.9)',
    borderRightColor: 'rgba(16, 85, 104, 0.08)',
    borderBottomColor: 'rgba(16, 85, 104, 0.1)',
  },
  metaChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: homeBrand.header,
    maxWidth: 140,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: 2,
  },
  specIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: NEO_SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.95)',
    borderLeftColor: 'rgba(255,255,255,0.9)',
    borderRightColor: 'rgba(16, 85, 104, 0.08)',
    borderBottomColor: 'rgba(16, 85, 104, 0.1)',
  },
  rebookText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: homeBrand.header,
  },
  openBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: homeBrand.header,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: homeBrand.header,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.28,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
});
