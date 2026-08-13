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
import type {
  DoctorsStackParamList,
  HospitalsStackParamList,
} from '../../../navigation/types';
import { colors, spacing, radius, shadows } from '../../../theme';

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
const PHOTO = Math.min(132, SCREEN_W * 0.34);

const GRADIENT_TOP = '#EAF7FB';
const GRADIENT_BOTTOM = '#BFDEF4';

function formatFee(fee: number) {
  return `PKR ${fee.toLocaleString()}`;
}

function withDr(name: string) {
  const trimmed = name.trim();
  if (/^dr\.?\s/i.test(trimmed)) return trimmed;
  return `Dr. ${trimmed}`;
}

function SoftGradient({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.gradientRoot}>
      <View pointerEvents="none" style={styles.gradientWash}>
        <View style={[styles.gradientStop, { backgroundColor: GRADIENT_TOP }]} />
        <View style={[styles.gradientStop, { backgroundColor: GRADIENT_BOTTOM }]} />
      </View>
      {children}
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  iconColor = colors.iconPrimary,
}: {
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Icon name={icon} size={18} color={iconColor} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function GlanceItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.glanceItem}>
      <Text style={styles.glanceLabel}>{label}</Text>
      <Text style={styles.glanceValue}>{value}</Text>
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

  const patientsLabel = useMemo(() => {
    if (!doctor) return '—';
    return formatConsultations(doctor.reviews);
  }, [doctor]);

  const patientsExact = useMemo(() => {
    if (!doctor) return '—';
    return String(Math.max(doctor.reviews * 6, 100));
  }, [doctor]);

  const handleBook = (option?: ConsultOption) => {
    const pick = option || options[0];
    navigation.navigate('DoctorBooking', {
      doctorId,
      consultType: pick?.type ?? consultType,
      practiceLocationId: pick?.practiceLocationId,
      hospitalId: pick?.hospitalId ?? hospitalId,
    });
  };

  if (isLoading) {
    return (
      <SoftGradient>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary700} />
        </View>
      </SoftGradient>
    );
  }

  if (isError || !doctor) {
    return (
      <SoftGradient>
        <View style={styles.centered}>
          <Text style={styles.muted}>Doctor not found</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.retry}>Go back</Text>
          </Pressable>
        </View>
      </SoftGradient>
    );
  }

  const aboutText =
    doctor.about?.trim() ||
    `${doctor.specialty} specialist with expertise in patient-centered care and preventive health.`;

  const followUpFee = Math.max(Math.round(doctor.fee * 0.45), 500);
  const experienceLabel = doctor.experienceYears
    ? `${doctor.experienceYears} years`
    : doctor.experience;

  return (
    <SoftGradient>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.sm,
            paddingBottom: Math.max(insets.bottom, spacing.md) + 96,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Nav */}
        <View style={styles.heroNav}>
          <Pressable
            style={styles.navBtn}
            onPress={() => navigation.goBack()}
            hitSlop={8}>
            <Icon name="arrow-left" size={22} color={colors.primary900} />
          </Pressable>
          <Pressable
            style={styles.navBtn}
            onPress={() => setFavorited(v => !v)}
            hitSlop={8}>
            <Icon
              name={favorited ? 'heart' : 'heart-outline'}
              size={22}
              color={favorited ? colors.error : colors.primary900}
            />
          </Pressable>
        </View>

        {/* Hero identity */}
        <View style={styles.heroBody}>
          <View style={styles.heroCopy}>
            <Text style={styles.specialty}>{doctor.specialty}</Text>
            <Text style={styles.name}>{withDr(doctor.name)}</Text>
            <Text style={styles.feeLine}>
              <Text style={styles.feeValue}>{formatFee(doctor.fee)}</Text>
              <Text style={styles.feeUnit}> /session</Text>
            </Text>
          </View>
          <Image
            source={{ uri: doctor.photo || doctor.image }}
            style={styles.heroPhoto}
          />
        </View>

        {/* Stats */}
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
            iconColor={colors.rating}
          />
          <StatCard
            icon="account-group-outline"
            label="Patients"
            value={patientsLabel}
          />
        </View>

        {/* Tabs attach to white content card */}
        <View style={styles.tabPanel}>
          <View style={styles.tabsRow}>
            {TABS.map(item => {
              const active = item.id === tab;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.tab, active && styles.tabActive]}
                  onPress={() => setTab(item.id)}>
                  <Text
                    style={[styles.tabText, active && styles.tabTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.panelBody}>
            {tab === 'info' ? (
              <>
                <Text style={styles.about}>{aboutText}</Text>
                <Text style={styles.sectionTitle}>At a Glance</Text>
                <View style={styles.glanceGrid}>
                  <GlanceItem
                    label="Consultation Fee"
                    value={`${formatFee(doctor.fee)} (incl. tax)`}
                  />
                  <GlanceItem
                    label="Follow-Up Fee"
                    value={`${formatFee(followUpFee)} (within 30 days)`}
                  />
                  <GlanceItem label="Patients Attended" value={patientsExact} />
                  <GlanceItem
                    label="Hospital"
                    value={doctor.hospital || 'Independent'}
                  />
                </View>
              </>
            ) : null}

            {tab === 'availability' ? (
              <>
                <Text style={styles.sectionTitle}>Consultation options</Text>
                {options.length > 0 ? (
                  options.map(option => (
                    <ConsultOptionRow
                      key={option.id}
                      option={option}
                      onPress={() => handleBook(option)}
                    />
                  ))
                ) : (
                  <Text style={styles.muted}>
                    No slots listed yet. You can still request a booking.
                  </Text>
                )}
              </>
            ) : null}

            {tab === 'education' ? (
              <>
                <Text style={styles.sectionTitle}>Qualifications</Text>
                {doctor.qualifications?.length ? (
                  doctor.qualifications.map(item => (
                    <View key={item} style={styles.eduRow}>
                      <View style={styles.eduDot} />
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
                    <Text style={styles.about}>
                      {doctor.languages.join(' · ')}
                    </Text>
                  </>
                ) : null}
              </>
            ) : null}

            {tab === 'reviews' ? (
              <>
                <View style={styles.reviewSummary}>
                  <Icon name="star" size={28} color={colors.rating} />
                  <View>
                    <Text style={styles.reviewScore}>
                      {doctor.rating.toFixed(1)}
                    </Text>
                    <Text style={styles.reviewCount}>
                      Based on {doctor.reviews} reviews
                    </Text>
                  </View>
                </View>
                <Text style={styles.muted}>
                  Patient reviews will show here as they come in.
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.lg) },
        ]}>
        <Pressable
          style={({ pressed }) => [
            styles.bookBtn,
            pressed && styles.bookBtnPressed,
          ]}
          onPress={() => handleBook()}>
          <Text style={styles.bookBtnText}>Book appointment</Text>
        </Pressable>
      </View>
    </SoftGradient>
  );
}

const styles = StyleSheet.create({
  gradientRoot: {
    flex: 1,
    backgroundColor: GRADIENT_TOP,
    overflow: 'hidden',
  },
  gradientWash: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientStop: {
    flex: 1,
  },

  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  muted: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
  },
  retry: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary700,
  },

  heroNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.cardSoft,
  },

  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: PHOTO,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
    paddingRight: spacing.xs,
  },
  specialty: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary500,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary900,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  feeLine: {
    marginTop: 4,
  },
  feeValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary700,
  },
  feeUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  heroPhoto: {
    width: PHOTO,
    height: PHOTO,
    borderRadius: 22,
    backgroundColor: colors.primary200,
  },

  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 4,
    ...shadows.card,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.primary500,
    marginTop: 2,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary900,
  },

  tabPanel: {
    gap: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: -1,
    zIndex: 2,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tabActive: {
    backgroundColor: colors.white,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary500,
  },
  tabTextActive: {
    color: colors.primary900,
    fontWeight: '700',
  },
  panelBody: {
    backgroundColor: colors.white,
    borderRadius: 24,
    borderTopLeftRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    ...shadows.cardElevated,
  },

  about: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.primary500,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary900,
    marginTop: spacing.xs,
  },
  sectionGap: {
    marginTop: spacing.md,
  },

  glanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.lg,
    columnGap: spacing.md,
  },
  glanceItem: {
    width: '47%',
    gap: 4,
  },
  glanceLabel: {
    fontSize: 12,
    color: colors.primary400,
    fontWeight: '500',
  },
  glanceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary900,
    lineHeight: 20,
  },

  eduRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  eduDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary700,
    marginTop: 7,
  },
  eduText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.primary500,
  },

  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  reviewScore: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary900,
  },
  reviewCount: {
    fontSize: 13,
    color: colors.primary500,
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: 'transparent',
  },
  bookBtn: {
    backgroundColor: '#0E304B',
    borderRadius: radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
    ...shadows.cardElevated,
  },
  bookBtnPressed: { opacity: 0.92 },
  bookBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
