import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDoctor } from '../../../lib/hooks/useApi';
import { formatConsultations } from '../../../lib/mappers/doctor';
import {
  buildDoctorConsultOptions,
  filterConsultOptions,
  type ConsultOption,
} from '../utils/consultOptions';
import { ConsultOptionRow } from '../components/ConsultOptionRow';
import { doctorsBrand } from '../doctorsBrand';
import { StackBackButton } from '../../../components/navigation/StackBackButton';
import type {
  DoctorsStackParamList,
  HospitalsStackParamList,
} from '../../../navigation/types';
import { spacing, radius } from '../../../theme';
import { getStackHeaderPaddingTop } from '../../../theme/layout';
import { stackScreenTitleStyle } from '../../../theme/appBrand';

type ProfileRoute = RouteProp<
  DoctorsStackParamList | HospitalsStackParamList,
  'DoctorProfile'
>;
type ProfileNav = NativeStackNavigationProp<
  DoctorsStackParamList | HospitalsStackParamList,
  'DoctorProfile'
>;

type TabId = 'info' | 'availability' | 'education' | 'reviews';

const TABS: { id: TabId; label: string }[] = [
  { id: 'info', label: 'Info' },
  { id: 'availability', label: 'Availability' },
  { id: 'education', label: 'Education' },
  { id: 'reviews', label: 'Reviews' },
];

const SCREEN_W = Dimensions.get('window').width;
const PHOTO = Math.min(136, SCREEN_W * 0.34);

function formatFee(fee: number) {
  return `PKR ${fee.toLocaleString()}`;
}

function withDr(name: string) {
  const trimmed = name.trim();
  if (/^dr\.?\s/i.test(trimmed)) return trimmed;
  return `Dr. ${trimmed}`;
}

function StatCard({
  icon,
  label,
  value,
  iconColor = doctorsBrand.accent,
}: {
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconWrap}>
        <Icon name={icon} size={15} color={iconColor} />
      </View>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function GlanceItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.glanceItem}>
      <Text style={styles.glanceLabel}>{label}</Text>
      <Text style={styles.glanceValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export function DoctorProfileScreen() {
  const navigation = useNavigation<ProfileNav>();
  const route = useRoute<ProfileRoute>();
  const insets = useSafeAreaInsets();
  const { doctorId, hospitalId, consultType = 'in_person' } = route.params;

  const [tab, setTab] = useState<TabId>('info');
  const [favorited, setFavorited] = useState(false);

  const { data: doctor, isLoading, isError } = useDoctor(doctorId);

  const options = useMemo(() => {
    if (!doctor) return [];
    const all = buildDoctorConsultOptions(doctor, hospitalId ?? null);
    return filterConsultOptions(all, consultType);
  }, [doctor, hospitalId, consultType]);

  const allOptions = useMemo(() => {
    if (!doctor) return [];
    return buildDoctorConsultOptions(doctor, hospitalId ?? null);
  }, [doctor, hospitalId]);

  const patientsLabel = useMemo(() => {
    if (!doctor) return '—';
    return formatConsultations(doctor.reviews);
  }, [doctor]);

  const patientsExact = useMemo(() => {
    if (!doctor) return '—';
    return String(Math.max(doctor.reviews * 6, 100));
  }, [doctor]);

  const availableDays = useMemo(() => {
    const days = new Set<string>();
    allOptions.forEach(opt => opt.days?.forEach(d => days.add(d)));
    return Array.from(days);
  }, [allOptions]);

  const topPad = getStackHeaderPaddingTop(insets.top);
  const bottomPad = Math.max(insets.bottom, 8);

  const handleBook = (option?: ConsultOption) => {
    const pick = option || options[0] || allOptions[0];
    navigation.navigate('DoctorBooking', {
      doctorId,
      consultType: pick?.type ?? consultType,
      practiceLocationId: pick?.practiceLocationId,
      hospitalId: pick?.hospitalId ?? hospitalId,
    });
  };

  const handleShare = async () => {
    if (!doctor) return;
    try {
      await Share.share({
        message: `${withDr(doctor.name)} · ${doctor.specialty} on Medzoos\nFee: ${formatFee(doctor.fee)} /session`,
        title: withDr(doctor.name),
      });
    } catch {
      // cancelled
    }
  };

  if (isLoading) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={doctorsBrand.accent} />
        </View>
      </View>
    );
  }

  if (isError || !doctor) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.centered}>
          <Text style={styles.muted}>Doctor not found</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.retry}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const aboutText =
    doctor.about?.trim() ||
    `${doctor.specialty} specialist focused on patient-centered care, clear diagnosis, and practical treatment plans.`;

  const followUpFee = Math.max(Math.round(doctor.fee * 0.45), 500);
  const experienceLabel = doctor.experienceYears
    ? `${doctor.experienceYears} years`
    : doctor.experience;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={[styles.topBar, { paddingTop: topPad }]}>
        <StackBackButton onPress={() => navigation.goBack()} />
        <Text style={styles.topTitle} numberOfLines={1}>
          Doctor
        </Text>
        <View style={styles.navRight}>
          <Pressable
            style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
            onPress={() => setFavorited(v => !v)}
            hitSlop={8}>
            <Icon
              name={favorited ? 'heart' : 'heart-outline'}
              size={18}
              color={favorited ? doctorsBrand.danger : doctorsBrand.accent}
            />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.navBtn, pressed && styles.navBtnPressed]}
            onPress={handleShare}
            hitSlop={8}>
            <Icon name="share-variant-outline" size={17} color={doctorsBrand.accent} />
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.heroBody}>
          <View style={styles.heroCopy}>
            <Text style={styles.specialty}>{doctor.specialty}</Text>
            <Text style={styles.name} numberOfLines={2}>
              {withDr(doctor.name)}
            </Text>
            <View style={styles.ratingRow}>
              <Icon name="star" size={13} color={doctorsBrand.star} />
              <Text style={styles.ratingText}>
                {doctor.rating.toFixed(1)}{' '}
                <Text style={styles.ratingCount}>({doctor.reviews})</Text>
              </Text>
            </View>
            <Text style={styles.feeLine}>
              <Text style={styles.feeValue}>{formatFee(doctor.fee)}</Text>
              <Text style={styles.feeUnit}> /session</Text>
            </Text>
          </View>
          <View style={styles.photoWrap}>
            <Image
              source={{ uri: doctor.photo || doctor.image }}
              style={styles.heroPhoto}
            />
            {doctor.online ? (
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon="briefcase-outline"
            label="Experience"
            value={experienceLabel}
          />
          <StatCard
            icon="star"
            label="Rating"
            value={doctor.rating.toFixed(1)}
            iconColor={doctorsBrand.star}
          />
          <StatCard
            icon="account-group-outline"
            label="Patients"
            value={patientsLabel}
          />
        </View>

        <View style={styles.sheet}>
          <View style={styles.tabsRow}>
            {TABS.map(item => {
              const active = item.id === tab;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.tab, active && styles.tabActive]}
                  onPress={() => setTab(item.id)}>
                  <Text
                    style={[styles.tabText, active && styles.tabTextActive]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView
            style={styles.panelScroll}
            contentContainerStyle={styles.panelBody}
            showsVerticalScrollIndicator={false}
            bounces={false}>
            {tab === 'info' ? (
              <>
                <Text style={styles.about} numberOfLines={3}>
                  {aboutText}
                </Text>
                <Text style={styles.sectionTitle}>At a glance</Text>
                <View style={styles.glanceGrid}>
                  <GlanceItem
                    label="Consultation fee"
                    value={`${formatFee(doctor.fee)} (incl. tax)`}
                  />
                  <GlanceItem
                    label="Follow-up fee"
                    value={`${formatFee(followUpFee)} (30 days)`}
                  />
                  <GlanceItem label="Patients attended" value={patientsExact} />
                  <GlanceItem
                    label="Hospital"
                    value={doctor.hospital || 'Independent'}
                  />
                </View>
              </>
            ) : null}

            {tab === 'availability' ? (
              <>
                <View style={styles.availHeader}>
                  <Text style={styles.sectionTitle}>Consultation options</Text>
                  <Text style={styles.slotsMeta}>
                    {allOptions.length}{' '}
                    {allOptions.length === 1 ? 'option' : 'options'}
                  </Text>
                </View>
                {allOptions.length > 0 ? (
                  <View style={styles.optionsList}>
                    {allOptions.map(option => (
                      <ConsultOptionRow
                        key={option.id}
                        option={option}
                        compact
                        onPress={() => handleBook(option)}
                      />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.muted}>
                    No slots listed yet. You can still request a booking.
                  </Text>
                )}
                {availableDays.length > 0 ? (
                  <>
                    <Text style={[styles.sectionTitle, styles.sectionGap]}>
                      Usual days
                    </Text>
                    <View style={styles.daysRow}>
                      {availableDays.map(day => (
                        <View key={day} style={styles.dayChip}>
                          <Text style={styles.dayChipText}>{day}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : null}
              </>
            ) : null}

            {tab === 'education' ? (
              <>
                <Text style={styles.sectionTitle}>Qualifications</Text>
                {doctor.qualifications?.length ? (
                  doctor.qualifications.map(item => (
                    <View key={item} style={styles.eduRow}>
                      <View style={styles.eduIcon}>
                        <Icon
                          name="school-outline"
                          size={14}
                          color={doctorsBrand.accent}
                        />
                      </View>
                      <Text style={styles.eduText}>{item}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.muted}>
                    Qualifications will appear once shared by the doctor.
                  </Text>
                )}
                {doctor.languages?.length ? (
                  <>
                    <Text style={[styles.sectionTitle, styles.sectionGap]}>
                      Languages
                    </Text>
                    <View style={styles.daysRow}>
                      {doctor.languages.map(lang => (
                        <View key={lang} style={styles.dayChip}>
                          <Text style={styles.dayChipText}>{lang}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : null}
              </>
            ) : null}

            {tab === 'reviews' ? (
              <>
                <View style={styles.reviewSummary}>
                  <View style={styles.reviewScoreCard}>
                    <Icon name="star" size={18} color={doctorsBrand.star} />
                    <Text style={styles.reviewScore}>
                      {doctor.rating.toFixed(1)}
                    </Text>
                  </View>
                  <View style={styles.reviewMeta}>
                    <Text style={styles.reviewTitle}>Patient rating</Text>
                    <Text style={styles.reviewCount}>
                      Based on {doctor.reviews} reviews
                    </Text>
                  </View>
                </View>
                <View style={styles.reviewEmpty}>
                  <Icon
                    name="message-text-outline"
                    size={18}
                    color={doctorsBrand.muted}
                  />
                  <Text style={styles.muted}>
                    Detailed patient reviews will show here as they come in.
                  </Text>
                </View>
              </>
            ) : null}
          </ScrollView>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: bottomPad }]}>
        <Pressable
          style={({ pressed }) => [
            styles.bookBtn,
            pressed && styles.bookBtnPressed,
          ]}
          onPress={() => handleBook()}>
          <Text style={styles.bookBtnText}>Book appointment</Text>
          <Icon name="arrow-right" size={17} color={doctorsBrand.onAccent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: doctorsBrand.page,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: 10,
  },
  topTitle: {
    flex: 1,
    ...stackScreenTitleStyle,
    paddingHorizontal: spacing.sm,
  },
  navRight: {
    flexDirection: 'row',
    gap: spacing.sm,
    minWidth: 88,
    justifyContent: 'flex-end',
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: doctorsBrand.card,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: doctorsBrand.ink,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  navBtnPressed: { opacity: 0.82 },

  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 4,
    gap: spacing.md,
    paddingBottom: 72,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  muted: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    color: doctorsBrand.muted,
  },
  retry: {
    fontSize: 14,
    fontWeight: '700',
    color: doctorsBrand.accent,
  },

  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  specialty: {
    fontSize: 12,
    fontWeight: '600',
    color: doctorsBrand.muted,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.35,
    lineHeight: 27,
    color: doctorsBrand.ink,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: doctorsBrand.ink,
  },
  ratingCount: {
    fontWeight: '500',
    color: doctorsBrand.muted,
  },
  feeLine: {
    marginTop: 2,
  },
  feeValue: {
    fontSize: 15,
    fontWeight: '800',
    color: doctorsBrand.accent,
  },
  feeUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: doctorsBrand.muted,
  },
  photoWrap: {
    position: 'relative',
  },
  heroPhoto: {
    width: PHOTO,
    height: PHOTO,
    borderRadius: 22,
    backgroundColor: doctorsBrand.soft,
    borderWidth: 3,
    borderColor: doctorsBrand.card,
    ...Platform.select({
      ios: {
        shadowColor: doctorsBrand.ink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: doctorsBrand.card,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: doctorsBrand.success,
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '700',
    color: doctorsBrand.success,
  },

  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    backgroundColor: doctorsBrand.card,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
    minWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: doctorsBrand.ink,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: doctorsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: doctorsBrand.muted,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: doctorsBrand.ink,
    textAlign: 'center',
  },

  sheet: {
    flex: 1,
    backgroundColor: doctorsBrand.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
    overflow: 'hidden',
    paddingTop: 6,
    minHeight: 0,
    ...Platform.select({
      ios: {
        shadowColor: doctorsBrand.ink,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: radius.pill,
    backgroundColor: doctorsBrand.page,
    minWidth: 0,
  },
  tabActive: {
    backgroundColor: doctorsBrand.accent,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '700',
    color: doctorsBrand.muted,
    textAlign: 'center',
  },
  tabTextActive: {
    color: doctorsBrand.onAccent,
  },
  panelScroll: {
    flex: 1,
    minHeight: 0,
  },
  panelBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm + 2,
  },

  about: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    color: doctorsBrand.muted,
    backgroundColor: doctorsBrand.page,
    borderRadius: 14,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.15,
    color: doctorsBrand.ink,
  },
  sectionGap: {
    marginTop: 2,
  },
  availHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  slotsMeta: {
    fontSize: 10,
    fontWeight: '700',
    color: doctorsBrand.accent,
    backgroundColor: doctorsBrand.soft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },

  glanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
    columnGap: spacing.sm,
  },
  glanceItem: {
    width: '47%',
    gap: 3,
    backgroundColor: doctorsBrand.page,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
  },
  glanceLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: doctorsBrand.muted,
  },
  glanceValue: {
    fontSize: 12,
    fontWeight: '700',
    color: doctorsBrand.ink,
    lineHeight: 16,
  },

  optionsList: { gap: spacing.sm },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: doctorsBrand.soft,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
  },
  dayChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: doctorsBrand.accent,
  },

  eduRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: doctorsBrand.page,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
  },
  eduIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: doctorsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eduText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: doctorsBrand.ink,
    paddingTop: 5,
  },

  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    backgroundColor: doctorsBrand.page,
    borderRadius: 14,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
  },
  reviewScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: doctorsBrand.soft,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reviewScore: {
    fontSize: 20,
    fontWeight: '800',
    color: doctorsBrand.ink,
  },
  reviewMeta: { flex: 1, gap: 1 },
  reviewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: doctorsBrand.ink,
  },
  reviewCount: {
    fontSize: 11,
    fontWeight: '500',
    color: doctorsBrand.muted,
  },
  reviewEmpty: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: doctorsBrand.page,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: doctorsBrand.page,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: doctorsBrand.border,
  },
  bookBtn: {
    backgroundColor: doctorsBrand.accent,
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bookBtnPressed: { opacity: 0.92 },
  bookBtnText: {
    color: doctorsBrand.onAccent,
    fontWeight: '700',
    fontSize: 15,
  },
});
