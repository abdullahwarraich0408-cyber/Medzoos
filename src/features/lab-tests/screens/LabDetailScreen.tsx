import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useLab } from '../../../lib/hooks/useApi';
import { LabTestCard } from '../components/LabTestCard';
import type { LabTest } from '../../../lib/mappers/labTest';
import type { DoctorsStackParamList } from '../../../navigation/types';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';

type DetailRoute = RouteProp<DoctorsStackParamList, 'LabDetail'>;
type DetailNav = NativeStackNavigationProp<DoctorsStackParamList, 'LabDetail'>;

export function LabDetailScreen() {
  const navigation = useNavigation<DetailNav>();
  const route = useRoute<DetailRoute>();
  const { labId } = route.params;
  const [refreshing, setRefreshing] = useState(false);

  const { data: lab, isLoading, refetch } = useLab(labId);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleBook = (test: LabTest) => {
    navigation.navigate('LabTestBooking', { testId: test.id });
  };

  if (isLoading && !lab) {
    return (
      <ScreenLayout title="Lab" headerMode="stack" showSearch={false}>
        <View style={styles.centered}>
          <Text style={styles.muted}>Loading lab...</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (!lab) {
    return (
      <ScreenLayout title="Lab" headerMode="stack" showSearch={false}>
        <View style={styles.centered}>
          <Text style={styles.muted}>Lab not found</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={lab.name} headerMode="stack" showSearch={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.hero}>
          <Text style={styles.bio}>{lab.bio}</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{lab.address || '—'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hours</Text>
              <Text style={styles.infoValue}>{lab.operatingHours}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Collection</Text>
              <Text style={styles.infoValue}>
                {lab.homeCollection ? 'Home + lab visit' : lab.collectionAreas || lab.city}
              </Text>
            </View>
          </View>
          {lab.homeCollection ? (
            <View style={styles.homeBadge}>
              <Icon name="home" size={14} color={colors.brandPrimary} />
              <Text style={styles.homeBadgeText}>Home collection available</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>
          Available tests ({lab.tests.length})
        </Text>

        {lab.tests.length > 0 ? (
          <View style={styles.list}>
            {lab.tests.map(test => (
              <LabTestCard
                key={test.id}
                test={test}
                onBook={handleBook}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.muted}>No tests listed for this lab yet.</Text>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: {
    paddingHorizontal: calmLayout.screenPadding,
    paddingBottom: TAB_BAR_CLEARANCE + calmLayout.contentBottom,
    gap: calmLayout.blockGap,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { ...healthOsTypography.messageBody, color: colors.neutral500 },
  hero: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    gap: spacing.md,
  },
  bio: { ...healthOsTypography.messageBody, lineHeight: 22 },
  infoGrid: { gap: spacing.md },
  infoItem: { gap: 2 },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: { fontSize: 14, color: colors.neutral600, fontWeight: '600' },
  homeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.brandMist,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  homeBadgeText: { fontSize: 12, fontWeight: '700', color: colors.brandPrimary },
  sectionTitle: { ...healthOsTypography.sectionTitle },
  list: { gap: spacing.md },
});
