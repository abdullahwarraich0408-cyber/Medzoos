import { useMemo } from 'react';
import { useVendors, useDoctors, usePopularLabTests, useHospitals } from './useApi';
import { formatConsultations } from '../mappers/doctor';
import {
  NEARBY_PHARMACIES,
  FEATURED_DOCTORS,
  LAB_PACKAGES,
  FEATURED_HOSPITALS,
} from '../../features/home/data/homeData';
import type { Hospital } from '../mappers/hospital';

export type HomePharmacy = {
  id?: string;
  slug?: string;
  name: string;
  rating: number;
  reviews: number;
  time: string;
  distance: string;
  minOrder: string;
  open: boolean;
  bgImage: string;
};

export type HomeDoctor = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  consultations: string;
  fee: number;
  image: string;
};

export type HomeLabPackage = {
  id?: string;
  name: string;
  tests: string[];
  price: string;
  discount: string | null;
};

function formatDisplayDistance(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number') {
    const rounded = Math.round(value * 10) / 10;
    return `${rounded} km`;
  }
  const match = String(value).match(/([\d.]+)/);
  if (match) {
    const rounded = Math.round(parseFloat(match[1]) * 10) / 10;
    return `${rounded} km`;
  }
  return String(value);
}

export function useHomeData() {
  const vendorsQuery = useVendors();
  const doctorsQuery = useDoctors();
  const labTestsQuery = usePopularLabTests();
  const hospitalsQuery = useHospitals();

  const nearbyPharmacies = useMemo((): HomePharmacy[] => {
    const apiPharmacies = vendorsQuery.data ?? [];
    if (apiPharmacies.length > 0) {
      return apiPharmacies.slice(0, 4).map((vendor, i) => ({
        id: vendor.id,
        slug: vendor.slug,
        name: vendor.name,
        rating: vendor.rating,
        reviews: NEARBY_PHARMACIES[i]?.reviews ?? vendor.reviews ?? 200,
        time: (() => {
          const raw = vendor.deliveryTime?.split('–')[0]?.trim();
          if (!raw) return NEARBY_PHARMACIES[i]?.time || '30 mins';
          return raw.includes('min') ? raw : `${raw} mins`;
        })(),
        distance:
          formatDisplayDistance(vendor.distanceKm ?? vendor.distance) ||
          NEARBY_PHARMACIES[i]?.distance ||
          '1.2 km',
        minOrder: 'PKR 500',
        open: vendor.open,
        bgImage: vendor.bgImage,
      }));
    }
    return NEARBY_PHARMACIES;
  }, [vendorsQuery.data]);

  const featuredDoctors = useMemo((): HomeDoctor[] => {
    const apiDoctors = doctorsQuery.data ?? [];
    if (apiDoctors.length > 0) {
      return apiDoctors.slice(0, 4).map((doctor, i) => {
        const fallback = FEATURED_DOCTORS[i] || FEATURED_DOCTORS[0];
        const reviews = doctor.reviews ?? fallback.reviews;
        return {
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.specialty,
          rating: doctor.rating,
          reviews,
          consultations: formatConsultations(reviews),
          fee: doctor.fee ?? fallback.fee,
          image: doctor.photo || doctor.image || fallback.image,
        };
      });
    }
    return FEATURED_DOCTORS;
  }, [doctorsQuery.data]);

  const labPackages = useMemo((): HomeLabPackage[] => {
    const apiLabPackages = labTestsQuery.data ?? [];
    if (apiLabPackages.length > 0) {
      return apiLabPackages.slice(0, 4).map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        tests: [`${pkg.testsIncluded} tests included`],
        price: `PKR ${pkg.price.toLocaleString()}`,
        discount: pkg.discount,
      }));
    }
    return LAB_PACKAGES;
  }, [labTestsQuery.data]);

  const featuredHospitals = useMemo((): Hospital[] => {
    const apiHospitals = hospitalsQuery.data ?? [];
    if (apiHospitals.length > 0) {
      return apiHospitals.slice(0, 4);
    }
    return FEATURED_HOSPITALS;
  }, [hospitalsQuery.data]);

  const isLoading =
    vendorsQuery.isLoading ||
    doctorsQuery.isLoading ||
    labTestsQuery.isLoading ||
    hospitalsQuery.isLoading;

  const isError =
    vendorsQuery.isError ||
    doctorsQuery.isError ||
    labTestsQuery.isError ||
    hospitalsQuery.isError;

  const isRefreshing =
    vendorsQuery.isFetching ||
    doctorsQuery.isFetching ||
    labTestsQuery.isFetching ||
    hospitalsQuery.isFetching;

  const refetch = () =>
    Promise.all([
      vendorsQuery.refetch(),
      doctorsQuery.refetch(),
      labTestsQuery.refetch(),
      hospitalsQuery.refetch(),
    ]);

  const usingLiveData =
    (vendorsQuery.data?.length ?? 0) > 0 ||
    (doctorsQuery.data?.length ?? 0) > 0 ||
    (labTestsQuery.data?.length ?? 0) > 0 ||
    (hospitalsQuery.data?.length ?? 0) > 0;

  return {
    nearbyPharmacies,
    featuredDoctors,
    labPackages,
    featuredHospitals,
    isLoading,
    isError,
    isRefreshing,
    usingLiveData,
    refetch,
  };
}
