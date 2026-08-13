import { HomePage } from '../features/home/HomePage';
import { PrescriptionUploadScreen } from '../features/medicines/screens/PrescriptionUploadScreen';
import { colors } from '../theme';
import { PlaceholderScreen } from './PlaceholderScreen';

export function HomeScreen() {
  return <HomePage />;
}


export function HospitalsScreen() {
  return (
    <PlaceholderScreen
      title="Hospitals"
      subtitle="Find nearby hospitals and book appointments."
      icon="hospital-building"
      accent="#1565C0"
    />
  );
}

export function PharmaciesScreen() {
  return (
    <PlaceholderScreen
      title="Pharmacies"
      subtitle="Verified stores near you with fast delivery."
      icon="store"
      accent="#0F9D58"
    />
  );
}

export function OffersScreen() {
  return (
    <PlaceholderScreen
      title="Offers & Deals"
      subtitle="Exclusive discounts on medicines and health products."
      icon="tag"
      accent={colors.statusDanger}
    />
  );
}

export function PrescriptionsScreen() {
  return <PrescriptionUploadScreen />;
}

export function HelpScreen() {
  return (
    <PlaceholderScreen
      title="Help Center"
      subtitle="FAQs, support, and 24/7 customer assistance."
      icon="help-circle"
    />
  );
}

export function ContactScreen() {
  return (
    <PlaceholderScreen
      title="Contact Us"
      subtitle="Reach our support team for any questions."
      icon="phone"
    />
  );
}
