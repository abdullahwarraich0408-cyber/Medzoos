import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  vendorsApi,
  doctorsApi,
  labTestsApi,
  hospitalsApi,
  ordersApi,
  prescriptionOrdersApi,
  productsApi,
  cartApi,
  usersApi,
  addressesApi,
  familyVaultApi,
  prescriptionsApi,
  followUpsApi,
  type BookAppointmentPayload,
  type BookLabTestPayload,
  type CreateLabOrderPayload,
  type CreateOrderPayload,
} from '../api';
import type { SubmitPrescriptionOrderInput } from '../prescription/submitPrescriptionOrder';
import { mapPrescriptionOrderToFrontend } from '../mappers/prescriptionOrder';
import { mapVendorsToPharmacies } from '../mappers/vendor';
import {
  mapDoctorToFrontend,
  mapDoctorsToFrontend,
  mapDoctorAppointmentToFrontend,
  mapDoctorAppointmentsToFrontend,
} from '../mappers/doctor';
import {
  mapLabTestToFrontend,
  mapLabTestsToFrontend,
  mapLabTestBookingsToFrontend,
  mapLabToFrontend,
} from '../mappers/labTest';
import {
  mapProductToMedicine,
  mapProductsToMedicines,
} from '../mappers/product';
import { mapCartToFrontend } from '../mappers/cart';
import {
  mapMedicineOrderToFrontend,
  mergeAllOrders,
} from '../mappers/order';
import { mapHospitalToFrontend, mapHospitalsToFrontend } from '../mappers/hospital';
import { mergeProfileData } from '../profile/profileData';

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const data = await vendorsApi.getAll();
      return mapVendorsToPharmacies(data.vendors || []);
    },
    staleTime: 60_000,
  });
}

export function usePharmacy(vendorId?: string, slug?: string) {
  const query = useVendors();
  const pharmacy = useMemo(() => {
    const list = query.data ?? [];
    if (vendorId) return list.find(v => v.id === vendorId) ?? null;
    if (slug) return list.find(v => v.slug === slug) ?? null;
    return null;
  }, [query.data, vendorId, slug]);

  return {
    data: pharmacy,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useVendorProducts(vendorId?: string) {
  return useQuery({
    queryKey: ['products', 'vendor', vendorId],
    enabled: Boolean(vendorId),
    queryFn: async () => {
      const data = await productsApi.getAll({ vendor_id: vendorId! });
      return mapProductsToMedicines(data.products || []);
    },
    staleTime: 60_000,
  });
}

export function useDoctors(params: Record<string, string> = {}) {
  return useQuery({
    queryKey: ['doctors', params],
    queryFn: async () => {
      const data = await doctorsApi.getAll(params);
      return mapDoctorsToFrontend(data.doctors || []);
    },
    staleTime: 60_000,
  });
}

export function useHospitals(params: Record<string, string> = {}) {
  return useQuery({
    queryKey: ['hospitals', params],
    queryFn: async () => {
      const data = await hospitalsApi.getAll(params);
      return mapHospitalsToFrontend(data.hospitals || []);
    },
    staleTime: 60_000,
  });
}

export function useHospital(id?: string) {
  return useQuery({
    queryKey: ['hospital', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const data = await hospitalsApi.getById(id!);
      return mapHospitalToFrontend(data.hospital);
    },
    staleTime: 60_000,
  });
}

export function useHospitalDoctors(
  id?: string,
  params: Record<string, string> = {},
) {
  return useQuery({
    queryKey: ['hospital-doctors', id, params],
    enabled: Boolean(id),
    queryFn: async () => {
      const data = await hospitalsApi.getDoctors(id!, params);
      return {
        hospital: mapHospitalToFrontend(data.hospital),
        doctors: mapDoctorsToFrontend(data.doctors || []),
        specialties: data.specialties || [],
      };
    },
    staleTime: 60_000,
  });
}

export function useDoctorFilters() {
  return useQuery({
    queryKey: ['doctor-filters'],
    queryFn: async () => {
      const data = await doctorsApi.getFilters();
      return data.filters || {};
    },
    staleTime: 300_000,
  });
}

export function useDoctor(id: string | undefined) {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const data = await doctorsApi.getById(id!);
      const doctor = mapDoctorToFrontend(data.doctor || (data as never));
      if (!doctor) throw new Error('Doctor not found');
      return doctor;
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useDoctorSlots(
  id: string | undefined,
  date: string | undefined,
  slotParams: Record<string, string> = {},
) {
  return useQuery({
    queryKey: ['doctor-slots', id, date, slotParams],
    queryFn: async () => {
      const data = await doctorsApi.getSlots(id!, date!, slotParams);
      return {
        slots: data.slots || [],
        booked: data.booked || [],
        ranges: data.ranges || [],
        day: data.day || '',
        worksThisDay: data.works_this_day !== false,
        locationTitle: data.location_title || '',
        fee: data.fee,
      };
    },
    enabled: Boolean(id && date),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useBookDoctorAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookAppointmentPayload) =>
      doctorsApi.bookAppointment(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      queryClient.invalidateQueries({ queryKey: ['patient-follow-ups'] });
      queryClient.invalidateQueries({
        queryKey: ['doctor-slots', variables.doctor_id],
      });
    },
  });
}

export function useDoctorAppointments(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['doctor-appointments'],
    queryFn: async () => {
      const data = await doctorsApi.getMyAppointments();
      return mapDoctorAppointmentsToFrontend(
        (data.appointments || []) as Record<string, unknown>[],
      );
    },
    staleTime: 20_000,
    ...options,
  });
}

export function useDoctorAppointment(
  id: string | undefined,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ['doctor-appointments', id],
    enabled: Boolean(id) && (options.enabled ?? true),
    queryFn: async () => {
      const data = await doctorsApi.getMyAppointment(id!);
      const mapped = mapDoctorAppointmentToFrontend(
        (data.appointment || data) as Record<string, unknown>,
      );
      if (!mapped) throw new Error('Appointment not found');
      return mapped;
    },
    staleTime: 15_000,
    ...options,
  });
}

export function usePatientFollowUps(
  options: { status?: string; enabled?: boolean } = {},
) {
  const { status, ...queryOptions } = options;
  return useQuery({
    queryKey: ['patient-follow-ups', status || 'all'],
    queryFn: async () => {
      const params: Record<string, string> = status ? { status } : {};
      const data = await followUpsApi.list(params);
      return (data.followUps || data.follow_ups || []) as Array<
        Record<string, unknown>
      >;
    },
    staleTime: 30_000,
    ...queryOptions,
  });
}

export function useFollowUpAvailableSlots(
  followUpId: string | undefined,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ['follow-up-slots', followUpId],
    enabled:
      options.enabled !== undefined
        ? Boolean(options.enabled) && Boolean(followUpId)
        : Boolean(followUpId),
    queryFn: async () => followUpsApi.getAvailableSlots(followUpId!),
    staleTime: 15_000,
  });
}

export function useBookFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      slot_id: string;
      mode: string;
      payment_method?: string;
    }) => followUpsApi.book(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      queryClient.invalidateQueries({ queryKey: ['follow-up-slots'] });
    },
  });
}

export function useCancelDoctorAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => doctorsApi.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-slots'] });
    },
  });
}

export function useRescheduleDoctorAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      appointment_date: string;
      slot: string;
    }) => doctorsApi.rescheduleAppointment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-slots'] });
    },
  });
}

export function useJoinDoctorConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => doctorsApi.joinConsultation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
    },
  });
}

export function useSelectConsultationMode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      mode,
    }: {
      id: string;
      mode: 'online' | 'in_person';
    }) => doctorsApi.selectConsultationMode(id, mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
    },
  });
}

export function useSubmitDoctorReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      doctorId,
      ...data
    }: {
      doctorId: string;
      appointment_id?: string;
      rating: number;
      comment?: string;
    }) => doctorsApi.submitReview(doctorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
    },
  });
}

export function useLabTestCategories() {
  return useQuery({
    queryKey: ['lab-test-categories'],
    queryFn: async () => {
      const data = await labTestsApi.getCategories();
      return data.categories || [];
    },
    staleTime: 120_000,
  });
}

export function useLabTestTimeSlots() {
  return useQuery({
    queryKey: ['lab-test-time-slots'],
    queryFn: async () => {
      const data = await labTestsApi.getTimeSlots();
      return data.timeSlots || data.time_slots || [];
    },
    staleTime: 120_000,
  });
}

export function useLabTests(params: Record<string, string> = {}) {
  return useQuery({
    queryKey: ['lab-tests', params],
    queryFn: async () => {
      const data = await labTestsApi.getAll(params);
      return mapLabTestsToFrontend(data.tests || []);
    },
    staleTime: 60_000,
  });
}

export function usePopularLabTests() {
  return useQuery({
    queryKey: ['lab-tests-popular'],
    queryFn: async () => {
      const data = await labTestsApi.getPopular();
      return mapLabTestsToFrontend(data.tests || []);
    },
    staleTime: 60_000,
  });
}

export function useLabs(params: Record<string, string> = {}) {
  return useQuery({
    queryKey: ['labs', params],
    queryFn: async () => {
      const data = await labTestsApi.getLabs(params);
      return (data.labs || [])
        .map(lab => mapLabToFrontend(lab))
        .filter((item): item is NonNullable<ReturnType<typeof mapLabToFrontend>> =>
          Boolean(item),
        );
    },
    staleTime: 60_000,
  });
}

export function useLab(id?: string) {
  return useQuery({
    queryKey: ['lab', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const data = await labTestsApi.getLabById(id!);
      const lab = mapLabToFrontend(data.lab);
      if (!lab) throw new Error('Lab not found');
      return lab;
    },
    staleTime: 60_000,
  });
}

export function useLabTest(id: string | undefined) {
  return useQuery({
    queryKey: ['lab-test', id],
    queryFn: async () => {
      const data = await labTestsApi.getById(id!);
      const raw = data.test || data.lab_test || (data as never);
      const test = mapLabTestToFrontend(raw);
      if (!test) throw new Error('Lab test not found');
      return test;
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useBookLabTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookLabTestPayload) => labTestsApi.book(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-test-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
    },
  });
}

export function useCreateLabOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLabOrderPayload) =>
      labTestsApi.createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-test-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['lab-test-reports'] });
    },
  });
}

export function useLabTestBookings(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['lab-test-bookings'],
    queryFn: async () => {
      const data = await labTestsApi.getMyBookings();
      return mapLabTestBookingsToFrontend(data.bookings || []);
    },
    staleTime: 30_000,
    ...options,
  });
}

export function useLabReports(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['lab-test-reports'],
    queryFn: async () => {
      const data = await labTestsApi.getMyReports();
      const list = data.reports || data.bookings || [];
      return mapLabTestBookingsToFrontend(list);
    },
    staleTime: 30_000,
    ...options,
  });
}

export function useProducts(params: Record<string, string> = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const data = await productsApi.getAll(params);
      return mapProductsToMedicines(data.products || []);
    },
    staleTime: 60_000,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const data = await productsApi.getById(id!);
      const medicine = mapProductToMedicine(data.product || (data as never));
      if (!medicine) throw new Error('Product not found');
      return medicine;
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useProductReviews(id: string | undefined) {
  return useQuery({
    queryKey: ['product-reviews', id],
    queryFn: async () => {
      const data = await productsApi.getReviews(id!);
      return data.reviews || [];
    },
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useCart(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const data = await cartApi.get();
      return mapCartToFrontend(data.cart || { items: data.items });
    },
    staleTime: 15_000,
    ...options,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity = 1 }: { productId: string; quantity?: number }) =>
      cartApi.addItem(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useAllOrders(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['all-orders'],
    queryFn: async () => {
      const [ordersResult, appointmentsResult, bookingsResult, prescriptionResult] =
        await Promise.all([
          ordersApi.getAll().catch(() => ({ orders: [] })),
          doctorsApi.getMyAppointments().catch(() => ({ appointments: [] })),
          labTestsApi.getMyBookings().catch(() => ({ bookings: [] })),
          prescriptionOrdersApi.getAll().catch(() => ({ orders: [] })),
        ]);

      return mergeAllOrders(
        ordersResult.orders || [],
        (appointmentsResult.appointments || []) as Record<string, unknown>[],
        bookingsResult.bookings || [],
        prescriptionResult.orders || [],
      );
    },
    staleTime: 30_000,
    ...options,
  });
}

export function useOrders(options: { enabled?: boolean } = {}) {
  const query = useAllOrders(options);
  return {
    ...query,
    data: query.data?.filter(order => order.type === 'medicines'),
  };
}

export function useUnifiedOrder(
  orderRef: string | undefined,
  options: { enabled?: boolean } = {},
) {
  const { data: orders = [], isLoading, isError, refetch } = useAllOrders({
    enabled: options.enabled ?? true,
  });

  const order = orders.find(item => item.id === orderRef);

  return {
    data: order,
    isLoading,
    isError: isError || (!isLoading && orderRef && !order),
    refetch,
  };
}

/** @deprecated Use useUnifiedOrder with orderRef */
export function useOrder(id: string | undefined, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const data = await ordersApi.getById(id!);
      const order = mapMedicineOrderToFrontend(data.order || (data as never));
      if (!order) throw new Error('Order not found');
      return order;
    },
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: 30_000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUserProfile(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const data = await usersApi.getProfile();
      return data.user;
    },
    staleTime: 60_000,
    ...options,
  });
}

export function useProfileData(options: { enabled?: boolean } = {}) {
  const query = useUserProfile(options);
  const data = useMemo(
    () => mergeProfileData(query.data?.profile_data),
    [query.data?.profile_data],
  );
  return {
    ...query,
    data,
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof usersApi.updateProfile>[0]) =>
      usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

export function useUpdateProfileData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profile_data: import('../profile/profileData').ProfileData) =>
      usersApi.updateProfile({ profile_data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      usersApi.changePassword(data),
  });
}

export function useAddresses(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const data = await addressesApi.getAll();
      return data.addresses || [];
    },
    staleTime: 60_000,
    ...options,
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useFamilyVault(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['family-vault'],
    queryFn: async () => {
      const res = await familyVaultApi.getFamily();
      return res?.vault ?? null;
    },
    retry: 1,
    staleTime: 30_000,
    ...options,
  });
}

export function useFamilyDashboard(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['family-vault-dashboard'],
    queryFn: () => familyVaultApi.getDashboard(),
    retry: 1,
    staleTime: 30_000,
    ...options,
  });
}

function invalidateFamilyVault(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['family-vault'] });
  queryClient.invalidateQueries({ queryKey: ['family-vault-dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['family-vault-calendar'] });
  queryClient.invalidateQueries({ queryKey: ['family-vault-ai-insights'] });
  queryClient.invalidateQueries({ queryKey: ['family-vault-weekly-summary'] });
}

export function useFamilyCalendar(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['family-vault-calendar'],
    queryFn: async () => {
      const res = await familyVaultApi.getCalendar();
      return res?.events ?? [];
    },
    staleTime: 30_000,
    ...options,
  });
}

export function useFamilyAiInsights(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['family-vault-ai-insights'],
    queryFn: () => familyVaultApi.getAiInsights(),
    staleTime: 60_000,
    ...options,
  });
}

export function useFamilyWeeklySummary(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['family-vault-weekly-summary'],
    queryFn: () => familyVaultApi.getWeeklySummary(),
    staleTime: 60_000,
    ...options,
  });
}

export function useFamilyCopilotQuery() {
  return useMutation({
    mutationFn: (question: string) => familyVaultApi.copilotQuery(question),
  });
}

export function useFamilyMember(memberId: string | undefined, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['family-vault-member', memberId],
    queryFn: async () => {
      const res = await familyVaultApi.getMember(memberId!);
      return res?.member ?? null;
    },
    enabled: Boolean(memberId) && options.enabled !== false,
    staleTime: 20_000,
  });
}

export function useAddMemberVital() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      ...data
    }: {
      memberId: string;
      vital_type: string;
      value: string;
      unit?: string;
      recorded_at?: string;
    }) => familyVaultApi.addVital(memberId, data),
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: ['family-vault-member', memberId] });
      invalidateFamilyVault(queryClient);
    },
  });
}

export function useAddMemberPrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      ...data
    }: {
      memberId: string;
      file_url: string;
      file_type?: string;
    }) => familyVaultApi.addPrescription(memberId, data),
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: ['family-vault-member', memberId] });
      invalidateFamilyVault(queryClient);
    },
  });
}

export function useDeleteMemberPrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      prescriptionId,
    }: {
      memberId: string;
      prescriptionId: string;
    }) => familyVaultApi.deletePrescription(memberId, prescriptionId),
    onSuccess: (_, { memberId }) => {
      queryClient.invalidateQueries({ queryKey: ['family-vault-member', memberId] });
      invalidateFamilyVault(queryClient);
    },
  });
}

export function useReadPrescription() {
  return useMutation({
    mutationFn: (data: { file_url: string }) => prescriptionsApi.read(data),
  });
}

export function useCreatePrescriptionOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitPrescriptionOrderInput) =>
      prescriptionOrdersApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescription-orders'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
    },
  });
}

export function usePrescriptionOrders(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['prescription-orders'],
    queryFn: async () => {
      const data = await prescriptionOrdersApi.getAll();
      return (data.orders || [])
        .map(mapPrescriptionOrderToFrontend)
        .filter((item): item is NonNullable<ReturnType<typeof mapPrescriptionOrderToFrontend>> =>
          Boolean(item),
        );
    },
    staleTime: 30_000,
    ...options,
  });
}

export function useCreateFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: familyVaultApi.createFamily,
    onSuccess: () => invalidateFamilyVault(queryClient),
  });
}

export function useAddFamilyMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: familyVaultApi.addMember,
    onSuccess: () => invalidateFamilyVault(queryClient),
  });
}
