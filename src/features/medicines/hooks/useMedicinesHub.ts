import { useCallback, useMemo, useState } from 'react';
import { useProducts } from '../../../lib/hooks/useApi';
import type { Medicine } from '../../../lib/mappers/product';
import {
  DEMO_PATIENT_MEDICINES,
  DEMO_PRESCRIPTIONS,
  buildTodayReminders,
  getActiveMedicines,
  getRefillMedicines,
  searchMedicines,
  searchPrescriptions,
  type PatientMedicine,
  type PatientPrescription,
  type ShopCategoryId,
} from '../data/medicineModel';
import { MOCK_MEDICINES, applyMedicineFilters, DEFAULT_MEDICINE_FILTERS } from '../data/mockMedicines';

function filterShopProducts(
  products: Medicine[],
  category: ShopCategoryId | 'all',
  search: string,
) {
  let list = applyMedicineFilters(products, search, DEFAULT_MEDICINE_FILTERS, 'relevance');
  const activeIds = new Set(DEMO_PATIENT_MEDICINES.map(m => m.productId).filter(Boolean));

  list = list.filter(p => !activeIds.has(p.id));

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

  const medicines = useMemo(() => DEMO_PATIENT_MEDICINES, []);
  const prescriptions = useMemo(() => DEMO_PRESCRIPTIONS, []);

  const shopProducts = apiProducts.length > 0 ? apiProducts : MOCK_MEDICINES;

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

  const filteredShop = useMemo(
    () => filterShopProducts(shopProducts, shopCategory, search),
    [shopProducts, shopCategory, search],
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
