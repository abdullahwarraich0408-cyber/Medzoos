import { colors, spacing, radius, shadows, TAB_BAR_CLEARANCE } from '../../theme';
import { healthOs } from '../../theme/healthOs';
import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../components/layout/ScreenLayout';
import { FILTER_OPTIONS } from '../doctors/data/mockDoctors';
import type { DoctorsStackParamList } from '../../navigation/types';


type Nav = NativeStackNavigationProp<DoctorsStackParamList>;

const SPECIALTY_ICONS: Record<string, string> = {
  'General Physician': 'account-heart',
  Cardiologist: 'heart-pulse',
  Dermatologist: 'face-woman-shimmer',
  Pediatrician: 'baby-face-outline',
  Gynecologist: 'human-female',
  Psychiatrist: 'brain',
  Orthopedic: 'bone',
};

export function ConsultSpecialtiesScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScreenLayout headerMode="stack" title="Specialties" showSearch={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          Choose a specialty to find the right doctor for you.
        </Text>
        <View style={styles.grid}>
          {FILTER_OPTIONS.specialties.map(specialty => (
            <Pressable
              key={specialty}
              style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
              onPress={() =>
                navigation.navigate('DoctorsList', {
                  specialty,
                  screenTitle: specialty,
                })
              }>
              <View style={styles.chipIcon}>
                <Icon
                  name={SPECIALTY_ICONS[specialty] || 'stethoscope'}
                  size={22}
                  color={colors.brandPrimary}
                />
              </View>
              <Text style={styles.chipLabel}>{specialty}</Text>
              <Icon name="chevron-right" size={18} color={colors.neutral500} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  lead: {
    fontSize: 14,
    color: colors.neutral600,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  grid: {
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    ...shadows.card,
  },
  chipPressed: {
    opacity: 0.92,
  },
  chipIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.inkHeadline,
  },
});