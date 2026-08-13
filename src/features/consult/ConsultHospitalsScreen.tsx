import { colors, spacing, radius, shadows, TAB_BAR_CLEARANCE } from '../../theme';
import { healthOs } from '../../theme/healthOs';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../components/layout/ScreenLayout';
import { useHospitals } from '../../lib/hooks/useApi';
import type { DoctorsStackParamList, HospitalsStackParamList } from '../../navigation/types';


type Nav = NativeStackNavigationProp<
  DoctorsStackParamList | HospitalsStackParamList,
  'HospitalsList'
>;

export function ConsultHospitalsScreen() {
  const navigation = useNavigation<Nav>();
  const { data: hospitals = [], isLoading, refetch, isFetching } = useHospitals();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return (
    <ScreenLayout headerMode="stack" title="Hospitals" showSearch={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isFetching}
            onRefresh={onRefresh}
            tintColor={colors.brandPrimary}
            colors={[colors.brandPrimary]}
          />
        }>
        {isLoading && !hospitals.length ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.brandPrimary} />
          </View>
        ) : (
          hospitals.map(hospital => (
            <TouchableOpacity
              key={hospital.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate('HospitalDetail', { hospitalId: hospital.id })
              }>
              <Image source={{ uri: hospital.coverImage }} style={styles.cover} />
              <View style={styles.body}>
                <Image source={{ uri: hospital.logo }} style={styles.logo} />
                <View style={styles.info}>
                  <Text style={styles.name}>{hospital.name}</Text>
                  <View style={styles.metaRow}>
                    <Icon name="map-marker" size={14} color={colors.neutral500} />
                    <Text style={styles.meta} numberOfLines={1}>
                      {hospital.city}
                      {hospital.address ? ` · ${hospital.address}` : ''}
                    </Text>
                  </View>
                  <Text style={styles.doctors}>
                    {hospital.doctorCount}+ Doctors available
                  </Text>
                </View>
                <Icon name="chevron-right" size={22} color={colors.neutral500} />
              </View>
            </TouchableOpacity>
          ))
        )}
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
    gap: spacing.md,
  },
  center: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    overflow: 'hidden',
    ...shadows.card,
  },
  cover: {
    width: '100%',
    height: 120,
    backgroundColor: colors.neutral100,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.neutral100,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    flex: 1,
    fontSize: 12,
    color: colors.neutral500,
  },
  doctors: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brandPrimary,
    marginTop: 4,
  },
});