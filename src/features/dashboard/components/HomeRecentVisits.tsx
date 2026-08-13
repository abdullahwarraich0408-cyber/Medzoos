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
import type { HomeDoctor } from '../../../lib/hooks/useHomeData';
import { colors, spacing, radius, shadows } from '../../../theme';
import { specialtyVisual } from '../../home/data/homeData';

const CARD_W = Dimensions.get('window').width * 0.72;

type HomeRecentVisitsProps = {
  doctors: HomeDoctor[];
  onSeeAll: () => void;
  onDoctorPress: (id: string) => void;
  onBookPress: (id: string) => void;
};

export function HomeRecentVisits({
  doctors,
  onSeeAll,
  onDoctorPress,
  onBookPress,
}: HomeRecentVisitsProps) {
  if (doctors.length === 0) return null;

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
        {doctors.map(doctor => {
          const visual = specialtyVisual(doctor.specialty);
          return (
            <Pressable
              key={doctor.id}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              onPress={() => onDoctorPress(doctor.id)}>
              <View style={styles.pill}>
                <View style={styles.pillIcon}>
                  <Icon name={visual.icon} size={16} color={colors.iconPrimary} />
                </View>
                <View style={styles.pillCopy}>
                  <Text style={styles.specName} numberOfLines={1}>
                    {doctor.specialty}
                  </Text>
                  <Text style={styles.specMeta} numberOfLines={1}>
                    Specialist · 5+ years
                  </Text>
                </View>
                <Image source={{ uri: doctor.image }} style={styles.photo} />
              </View>

              <Text style={styles.doctorName} numberOfLines={1}>
                {doctor.name}
              </Text>

              <View style={styles.bottomRow}>
                <View style={styles.ratingRow}>
                  <Icon name="star" size={15} color={colors.rating} />
                  <Text style={styles.rating}>
                    {doctor.rating.toFixed(1)}
                  </Text>
                  <Text style={styles.reviews}>({doctor.reviews})</Text>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.bookBtn,
                    pressed && styles.bookBtnPressed,
                  ]}
                  onPress={() => onBookPress(doctor.id)}
                  hitSlop={6}>
                  <Icon name="calendar-month" size={18} color={colors.iconWhite} />
                </Pressable>
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ratingText,
  },
  reviews: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  bookBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primary700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtnPressed: {
    backgroundColor: colors.primary800,
  },
});
