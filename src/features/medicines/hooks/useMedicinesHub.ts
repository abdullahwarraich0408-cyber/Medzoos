import { useCallback, useMemo, useState } from 'react';
import { useProducts } from '../../../lib/hooks/useApi';
import type { Medicine } from '../../../lib/mappers/product';
import {
  buildTodayReminders,
  getActiveMedicines,
  getRefillMedicines,
  searchMedicines,
  searchPrescriptions,
  type PatientMedicine,
  type PatientPrescription,
  type ShopCategoryId,
} from '../data/medicineModel';
import { applyMedicineFilters, DEFAULT_MEDICINE_FILTERS } from '../data/mockMedicines';

function filterShopProducts(
  products: Medicine[],
  category: ShopCategoryId | 'all',
  search: string,
  activeProductIds: Set<string>,
) {
  let list = applyMedicineFilters(products, search, DEFAULT_MEDICINE_FILTERS, 'relevance');

  list = list.filter(p => !activeProductIds.has(p.id));

  if (category === 'all') return list;
  if (category === 'prescription') {
    return list.filter(p => p.prescriptionRequired || p.category === 'Prescription');
  }
  if (category === 'otc') {
    return list.filter(p => p.category === 'OTC');
  }
  if (category === 'supplements') {
    return list.filter(
      p =>
        p.category === 'Supplements' ||
        p.category === 'Vitamins' ||
        (p.name || '').toLowerCase().includes('vitamin'),
    );
  }
  if (category === 'first_aid') {
    return list.filter(
      p =>
        p.category === 'Personal Care' ||
        p.category === 'Baby Care' ||
        (p.name || '').toLowerCase().includes('bandage'),
    );
  }
  return list;
}

export function useMedicinesHub(search: string) {
  const [takenIds, setTakenIds] = useState<Set<string>>(new Set());
  const [shopCategory, setShopCategory] = useState<ShopCategoryId | 'all'>('all');

  const { data: apiProducts = [], isLoading: productsLoading } = useProducts();

  const medicines = useMemo((): PatientMedicine[] => [], []);
  const prescriptions = useMemo((): PatientPrescription[] => [], []);

  const shopProducts = apiProducts;

  const todayReminders = useMemo(
    () => buildTodayReminders(medicines, takenIds),
    [medicines, takenIds],
  );

  const activeMedicines = useMemo(
    () => searchMedicines(getActiveMedicines(medicines), search),
    [medicines, search],
  );

  const refillMedicines = useMemo(
    () => searchMedicines(getRefillMedicines(medicines), search),
    [medicines, search],
  );

  const filteredPrescriptions = useMemo(
    () => searchPrescriptions(prescriptions, search),
    [prescriptions, search],
  );

  const activeProductIds = useMemo(
    () => new Set(medicines.map(m => m.productId).filter(Boolean) as string[]),
    [medicines],
  );

  const filteredShop = useMemo(
    () => filterShopProducts(shopProducts, shopCategory, search, activeProductIds),
    [shopProducts, shopCategory, search, activeProductIds],
  );

  const markTaken = useCallback((medicineId: string) => {
    setTakenIds(prev => new Set(prev).add(medicineId));
  }, []);

  return {
    medicines,
    prescriptions,
    todayReminders,
    activeMedicines,
    refillMedicines,
    filteredPrescriptions,
    filteredShop,
    shopCategory,
    setShopCategory,
    markTaken,
    productsLoading,
  };
}

export type { PatientMedicine, PatientPrescription };
