import { useMemo } from 'react';
import { useVendors, useDoctors, usePopularLabTests, useHospitals } from './useApi';
import { formatConsultations } from '../mappers/doctor';
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
    return apiPharmacies.slice(0, 4).map(vendor => {
      const raw = vendor.deliveryTime?.split('–')[0]?.trim();
      const time = raw
        ? raw.includes('min')
          ? raw
          : `${raw} mins`
        : '';
      return {
        id: vendor.id,
        slug: vendor.slug,
        name: vendor.name,
        rating: vendor.rating,
        reviews: vendor.reviews ?? 0,
        time,
        distance: formatDisplayDistance(vendor.distanceKm ?? vendor.distance) || '',
        minOrder: 'PKR 500',
        open: vendor.open,
        bgImage: vendor.bgImage,
      };
    });
  }, [vendorsQuery.data]);

  const featuredDoctors = useMemo((): HomeDoctor[] => {
    const apiDoctors = doctorsQuery.data ?? [];
    return apiDoctors.slice(0, 4).map(doctor => {
      const reviews = doctor.reviews ?? 0;
      return {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        rating: doctor.rating,
        reviews,
        consultations: formatConsultations(reviews),
        fee: doctor.fee ?? 0,
        image: doctor.photo || doctor.image || '',
      };
    });
  }, [doctorsQuery.data]);

  const labPackages = useMemo((): HomeLabPackage[] => {
    const apiLabPackages = labTestsQuery.data ?? [];
    return apiLabPackages.slice(0, 4).map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      tests: [`${pkg.testsIncluded} tests included`],
      price: `PKR ${pkg.price.toLocaleString()}`,
      discount: pkg.discount,
    }));
  }, [labTestsQuery.data]);

  const featuredHospitals = useMemo((): Hospital[] => {
    return (hospitalsQuery.data ?? []).slice(0, 4);
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
