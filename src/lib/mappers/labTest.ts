export type RawLabTest = {
  id?: string;
  name?: string;
  lab?: string;
  lab_partner_id?: string;
  lab_partner?: { id?: string; name?: string };
  category?: string;
  tests_included?: number | string;
  collection_time?: string;
  report_time?: string;
  price?: number;
  popular?: boolean;
  home_collection?: boolean;
  fasting_required?: boolean;
  preparation?: string;
  description?: string;
  discount?: string | null;
};

export type LabTest = {
  id: string;
  name: string;
  lab: string;
  labPartnerId?: string | null;
  category?: string;
  testsIncluded: number | string;
  collectionTime?: string;
  reportTime?: string;
  price: number;
  popular?: boolean;
  homeCollection?: boolean;
  fastingRequired?: boolean;
  preparation?: string;
  description?: string;
  discount: string | null;
};

export type RawLabBooking = {
  id?: string;
  order_group_id?: string;
  lab_test_id?: string;
  lab_test?: { name?: string; lab?: string };
  lab_partner?: { name?: string };
  time_slot?: string;
  collection_date?: string;
  collection_type?: string;
  price?: number;
  status?: string;
  payment_status?: string;
  report_url?: string;
  prescription_url?: string;
  patient_name?: string;
  collector_name?: string;
  collection_address?: { line?: string; city?: string; phone?: string };
};

export type LabBooking = {
  id: string;
  orderGroupId?: string;
  testId?: string;
  testName?: string;
  lab?: string;
  timeSlot?: string;
  collectionDate?: string;
  collectionType?: string;
  price?: number;
  status?: string;
  paymentStatus?: string;
  reportUrl?: string;
  patientName?: string;
  address?: { line?: string; city?: string; phone?: string };
};

export function mapLabTestToFrontend(test: RawLabTest): LabTest | null {
  if (!test?.id && !test?.name) return null;

  return {
    id: test.id || test.name || '',
    name: test.name || 'Lab Package',
    lab: test.lab || test.lab_partner?.name || 'Partner Lab',
    labPartnerId: test.lab_partner_id || test.lab_partner?.id || null,
    category: test.category,
    testsIncluded: test.tests_included ?? 0,
    collectionTime: test.collection_time,
    reportTime: test.report_time,
    price: test.price ?? 0,
    popular: Boolean(test.popular),
    homeCollection: Boolean(test.home_collection),
    fastingRequired: Boolean(test.fasting_required),
    preparation: test.preparation,
    description: test.description,
    discount: test.discount ?? null,
  };
}

export function mapLabTestsToFrontend(tests: RawLabTest[] = []): LabTest[] {
  return tests
    .map(mapLabTestToFrontend)
    .filter((item): item is LabTest => Boolean(item));
}

export function mapLabTestBookingToFrontend(
  booking: RawLabBooking,
): LabBooking | null {
  if (!booking?.id) return null;

  return {
    id: booking.id,
    orderGroupId: booking.order_group_id,
    testId: booking.lab_test_id,
    testName: booking.lab_test?.name,
    lab: booking.lab_test?.lab || booking.lab_partner?.name,
    timeSlot: booking.time_slot,
    collectionDate: booking.collection_date,
    collectionType: booking.collection_type,
    price: booking.price,
    status: booking.status,
    paymentStatus: booking.payment_status,
    reportUrl: booking.report_url,
    patientName: booking.patient_name,
    address: booking.collection_address,
  };
}

export function mapLabTestBookingsToFrontend(
  bookings: RawLabBooking[] = [],
): LabBooking[] {
  return bookings
    .map(mapLabTestBookingToFrontend)
    .filter((item): item is LabBooking => Boolean(item));
}

export type RawLabPartner = {
  id?: string;
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
  bio?: string;
  rating?: number;
  home_collection?: boolean;
  operating_hours?: string;
  collection_areas?: string;
  test_count?: number;
  min_price?: number;
  lab_tests?: RawLabTest[];
};

export type LabPartner = {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  bio: string;
  rating: number;
  homeCollection: boolean;
  operatingHours: string;
  collectionAreas: string;
  testCount: number;
  minPrice?: number;
  tests: LabTest[];
};

export function mapLabToFrontend(lab: RawLabPartner | null | undefined): LabPartner | null {
  if (!lab?.id) return null;
  return {
    id: lab.id,
    name: lab.name || 'Lab',
    address: lab.address || '',
    city: lab.city || '',
    phone: lab.phone,
    bio: lab.bio || 'Certified diagnostic laboratory',
    rating: lab.rating ?? 4.5,
    homeCollection: Boolean(lab.home_collection),
    operatingHours: lab.operating_hours || 'Mon–Sat 8am–8pm',
    collectionAreas: lab.collection_areas || lab.city || '',
    testCount: lab.test_count ?? lab.lab_tests?.length ?? 0,
    minPrice: lab.min_price,
    tests: mapLabTestsToFrontend(lab.lab_tests || []),
  };
}
