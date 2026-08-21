import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../components/layout/ScreenLayout';
import { useCartContext } from '../../lib/cart/CartContext';
import type { HealthStackParamList } from '../../navigation/types';
import { HealthSearchBar } from '../health/components/shared/HealthSearchBar';
import { HealthEmptyState } from '../health/components/shared/HealthEmptyState';
import { PrescriptionUploadCard } from './components/PrescriptionUploadCard';
import { MedicineHubTabs } from './components/MedicineHubTabs';
import { ActiveMedicineRow } from './components/ActiveMedicineRow';
import { RefillMedicineRow } from './components/RefillMedicineRow';
import { PrescriptionHubCard } from './components/PrescriptionHubCard';
import { ShopCategoryChips } from './components/ShopCategoryChips';
import { ShopMedicineRow } from './components/ShopMedicineRow';
import { useMedicinesHub } from './hooks/useMedicinesHub';
import type { MedicineHubTabId } from './data/medicineModel';
import { colors, spacing, TAB_BAR_CLEARANCE } from '../../theme';
import { calmLayout } from '../../theme/calmLayout';

type Nav = NativeStackNavigationProp<HealthStackParamList>;

export function MedicinesPage() {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<MedicineHubTabId>('my_medicines');
  const [refreshing, setRefreshing] = useState(false);
  const { refreshCartCount } = useCartContext();

  const {
    activeMedicines,
    refillMedicines,
    filteredPrescriptions,
    filteredShop,
    shopCategory,
    setShopCategory,
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
    navigation.navigate('UploadMedicalDocument');
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
              title="No medicines yet"
              subtitle="Upload a prescription or shop below."
            />
          );
        }
        return (
          <View style={styles.list}>
            {activeMedicines.map(medicine => (
              <ActiveMedicineRow
                key={medicine.medicineId}
                medicine={medicine}
                onPress={() =>
                  navigation.navigate('MedicineDetail', {
                    medicineId: medicine.medicineId,
                  })
                }
              />
            ))}
          </View>
        );

      case 'prescriptions':
        if (filteredPrescriptions.length === 0) {
          return (
            <HealthEmptyState
              icon="file-document-outline"
              title="No prescriptions"
              subtitle="Upload one to get started."
            />
          );
        }
        return (
          <View style={styles.list}>
            {filteredPrescriptions.map(prescription => (
              <PrescriptionHubCard
                key={prescription.prescriptionId}
                prescription={prescription}
                onPress={() =>
                  navigation.navigate('PrescriptionDetail', {
                    prescriptionId: prescription.prescriptionId,
                  })
                }
              />
            ))}
          </View>
        );

      case 'refills':
        if (refillMedicines.length === 0) {
          return (
            <HealthEmptyState
              icon="refresh"
              title="All stocked"
              subtitle="Nothing needs a refill right now."
            />
          );
        }
        return (
          <View style={styles.list}>
            {refillMedicines.map(medicine => (
              <RefillMedicineRow
                key={medicine.medicineId}
                medicine={medicine}
                onRefill={() => handleRefill(medicine.medicineId)}
              />
            ))}
          </View>
        );

      case 'shop':
        return (
          <View style={styles.shopSection}>
            <ShopCategoryChips active={shopCategory} onChange={setShopCategory} />
            {productsLoading ? (
              <Text style={styles.loadingText}>Loading…</Text>
            ) : filteredShop.length === 0 ? (
              <HealthEmptyState
                icon="store-outline"
                title="No products found"
                subtitle="Try another category or search."
              />
            ) : (
              <View style={styles.list}>
                {filteredShop.map(product => (
                  <ShopMedicineRow
                    key={product.id}
                    medicine={product}
                    onPress={() =>
                      navigation.navigate('ProductDetail', {
                        productId: product.id,
                      })
                    }
                  />
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
      title="Medicines"
      showSearch={false}
      showCart
      onCartPress={() => navigation.navigate('Cart')}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary700}
            colors={[colors.primary700]}
          />
        }>
        <PrescriptionUploadCard onUpload={handleUpload} />

        <HealthSearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search medicines or prescriptions"
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
    paddingBottom: TAB_BAR_CLEARANCE + calmLayout.contentBottom,
    gap: 20,
  },
  list: { gap: spacing.sm },
  shopSection: { gap: spacing.md },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
