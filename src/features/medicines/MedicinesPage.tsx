import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../components/layout/ScreenLayout';
import { useCartContext } from '../../lib/cart/CartContext';
import { navigateToDrawerScreen } from '../../lib/auth/navigation';
import type { HealthStackParamList } from '../../navigation/types';
import { HealthSearchBar } from '../health/components/shared/HealthSearchBar';
import { HealthEmptyState } from '../health/components/shared/HealthEmptyState';
import { TodayMedicinesCard } from './components/TodayMedicinesCard';
import { PrescriptionUploadCard } from './components/PrescriptionUploadCard';
import { MedicineHubTabs } from './components/MedicineHubTabs';
import { ActiveMedicineRow } from './components/ActiveMedicineRow';
import { RefillMedicineRow } from './components/RefillMedicineRow';
import { PrescriptionHubCard } from './components/PrescriptionHubCard';
import { ShopCategoryChips } from './components/ShopCategoryChips';
import { ShopMedicineRow } from './components/ShopMedicineRow';
import { useMedicinesHub } from './hooks/useMedicinesHub';
import type { MedicineHubTabId } from './data/medicineModel';
import { colors, spacing, TAB_BAR_CLEARANCE, cardStyles } from '../../theme';
import { healthOsTypography } from '../../theme/healthOs';
import { calmLayout } from '../../theme/calmLayout';

type Nav = NativeStackNavigationProp<HealthStackParamList>;

export function MedicinesPage() {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<MedicineHubTabId>('my_medicines');
  const [refreshing, setRefreshing] = useState(false);
  const { refreshCartCount } = useCartContext();

  const {
    todayReminders,
    activeMedicines,
    refillMedicines,
    filteredPrescriptions,
    filteredShop,
    shopCategory,
    setShopCategory,
    markTaken,
    productsLoading,
  } = useMedicinesHub(search);

  useFocusEffect(
    useCallback(() => {
      refreshCartCount();
    }, [refreshCartCount]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshCartCount();
    setRefreshing(false);
  }, [refreshCartCount]);

  const handleUpload = () => {
    navigateToDrawerScreen(navigation, 'Prescriptions');
  };

  const handleRefill = (medicineId: string) => {
    navigation.navigate('MedicineDetail', { medicineId });
  };

  const renderTabContent = () => {
    switch (tab) {
      case 'my_medicines':
        if (activeMedicines.length === 0) {
          return (
            <HealthEmptyState
              icon="pill"
              title="No active medicines"
              subtitle="Upload a prescription or order from Shop."
            />
          );
        }
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active medicines</Text>
            <View style={styles.listCard}>
              {activeMedicines.map((medicine, index) => (
                <React.Fragment key={medicine.medicineId}>
                  {index > 0 ? <View style={cardStyles.rowDivider} /> : null}
                  <ActiveMedicineRow
                    medicine={medicine}
                    onPress={() =>
                      navigation.navigate('MedicineDetail', {
                        medicineId: medicine.medicineId,
                      })
                    }
                  />
                </React.Fragment>
              ))}
            </View>
          </View>
        );

      case 'prescriptions':
        if (filteredPrescriptions.length === 0) {
          return (
            <HealthEmptyState
              icon="file-document-outline"
              title="No prescriptions"
              subtitle="Upload a prescription to get started."
            />
          );
        }
        return (
          <View style={styles.listCard}>
            {filteredPrescriptions.map((prescription, index) => (
              <React.Fragment key={prescription.prescriptionId}>
                {index > 0 ? <View style={cardStyles.rowDivider} /> : null}
                <PrescriptionHubCard
                  prescription={prescription}
                  onPress={() =>
                    navigation.navigate('PrescriptionDetail', {
                      prescriptionId: prescription.prescriptionId,
                    })
                  }
                />
              </React.Fragment>
            ))}
          </View>
        );

      case 'refills':
        if (refillMedicines.length === 0) {
          return (
            <HealthEmptyState
              icon="refresh"
              title="No refills needed"
              subtitle="Medicines running low will appear here."
            />
          );
        }
        return (
          <View style={styles.listCard}>
            {refillMedicines.map((medicine, index) => (
              <React.Fragment key={medicine.medicineId}>
                {index > 0 ? <View style={cardStyles.rowDivider} /> : null}
                <RefillMedicineRow
                  medicine={medicine}
                  onRefill={() => handleRefill(medicine.medicineId)}
                />
              </React.Fragment>
            ))}
          </View>
        );

      case 'shop':
        return (
          <View style={styles.section}>
            <ShopCategoryChips active={shopCategory} onChange={setShopCategory} />
            {productsLoading ? (
              <Text style={styles.loadingText}>Loading medicines...</Text>
            ) : filteredShop.length === 0 ? (
              <HealthEmptyState
                icon="store-outline"
                title="No products found"
                subtitle="Try another category or search term."
              />
            ) : (
              <View style={styles.listCard}>
                {filteredShop.map((product, index) => (
                  <React.Fragment key={product.id}>
                    {index > 0 ? <View style={cardStyles.rowDivider} /> : null}
                    <ShopMedicineRow
                      medicine={product}
                      onPress={() =>
                        navigation.navigate('ProductDetail', { productId: product.id })
                      }
                    />
                  </React.Fragment>
                ))}
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScreenLayout
      headerMode="stack"
      title="Prescriptions & Medicines"
      showSearch={false}
      showCart
      onCartPress={() => navigation.navigate('Cart')}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: TAB_BAR_CLEARANCE + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brandPrimary}
          />
        }>
        <Text style={styles.subtitle}>
          Manage your prescriptions, medicines, and refills.
        </Text>

        <TodayMedicinesCard
          reminders={todayReminders}
          onMarkTaken={markTaken}
          onViewAll={() =>
            Alert.alert('Reminders', 'Full reminder schedule coming soon.')
          }
        />

        <PrescriptionUploadCard onUpload={handleUpload} />

        <HealthSearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search medicines or prescriptions..."
          large
        />

        <MedicineHubTabs active={tab} onChange={setTab} />

        {renderTabContent()}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    padding: calmLayout.screenPadding,
    gap: calmLayout.sectionGap,
  },
  subtitle: {
    ...healthOsTypography.sectionHint,
    fontSize: 14,
    lineHeight: 21,
  },
  section: { gap: spacing.sm },
  sectionTitle: {
    ...healthOsTypography.sectionTitle,
    fontSize: 15,
  },
  listCard: {
    ...cardStyles.grouped,
  },
  loadingText: {
    fontSize: 13,
    color: colors.neutral500,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
