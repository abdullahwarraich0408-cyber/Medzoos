type ShoppingNav = {
  getState: () => { routeNames?: string[] };
  navigate: (screen: string) => void;
};

/** Return to the correct browse screen when cart/checkout is inside Pharmacies or Health stack. */
export function navigateContinueShopping(navigation: ShoppingNav) {
  const routeNames = navigation.getState()?.routeNames ?? [];
  if (routeNames.includes('PharmaciesList')) {
    navigation.navigate('PharmaciesList');
    return;
  }
  navigation.navigate('MedicinesList');
}
