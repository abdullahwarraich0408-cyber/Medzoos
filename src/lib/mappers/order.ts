import { DEFAULT_PRODUCT_IMAGE } from './product';
import type { RawLabBooking } from './labTest';
import {
  mapPrescriptionOrderToFrontend,
  type RawPrescriptionOrder,
} from './prescriptionOrder';

const LAB_TEST_IMAGE =
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=200&auto=format&fit=crop';
const DOCTOR_IMAGE =
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400';

export type OrderType =
  | 'medicines'
  | 'doctor'
  | 'lab'
  | 'prescription';

export type TrackingStep = {
  step: string;
  time: string;
  done: boolean;
};

export type UnifiedOrderItem = {
  name: string;
  qty: number;
  price: number;
  img: string;
};

export type UnifiedOrder = {
  id: string;
  sourceId: string;
  type: OrderType;
  title: string;
  date: string;
  sortDate?: string;
  status: string;
  rawStatus?: string;
  statusLabel?: string;
  total: number;
  vendor: string;
  testName?: string;
  specialty?: string;
  slot?: string;
  isOnline?: boolean;
  consultationMode?: string;
  isHospitalVisit?: boolean;
  items: UnifiedOrderItem[];
  tracking: TrackingStep[];
  deliveryAddress: string;
  reportUrl?: string;
  fileUrl?: string;
};

export type RawMedicineOrder = {
  id?: string;
  status?: string;
  total_amount?: number;
  created_at?: string;
  delivery_address?: string | { street?: string; city?: string; address?: string };
  vendor?: { business_name?: string };
  items?: Array<{
    name?: string;
    quantity?: number;
    unit_price?: number;
    price?: number;
    product?: { name?: string; image_url?: string };
  }>;
};

function formatOrderDate(dateString?: string) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatAddress(
  value?: string | { street?: string; city?: string; address?: string },
) {
  if (!value) return 'Address on file';
  if (typeof value === 'string') return value;
  return value.street || value.address || value.city || 'Address on file';
}

function normalizeMedicineStatus(status?: string) {
  return status || 'pending';
}

function normalizeDoctorStatus(status?: string) {
  if (status === 'completed') return 'delivered';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'confirmed' || status === 'in_progress') return 'processing';
  return 'pending';
}

function normalizeLabStatus(status?: string) {
  if (status === 'completed' || status === 'report_uploaded') return 'delivered';
  if (status === 'cancelled' || status === 'rejected') return 'cancelled';
  if (
    ['confirmed', 'collector_assigned', 'sample_collected', 'testing'].includes(
      status || '',
    )
  ) {
    return 'processing';
  }
  return 'pending';
}

function normalizePrescriptionStatus(status?: string) {
  if (status === 'delivered') return 'delivered';
  if (status === 'cancelled' || status === 'no_vendor') return 'cancelled';
  if (['packed', 'rider_assigned', 'out_for_delivery'].includes(status || '')) {
    return 'shipped';
  }
  if (
    [
      'finding_vendor',
      'awaiting_accept',
      'accepted',
      'stock_pending',
      'stock_confirmed',
      'customer_review',
      'confirmed',
    ].includes(status || '')
  ) {
    return 'processing';
  }
  return 'pending';
}

function buildMedicineTracking(status?: string, createdAt?: string): TrackingStep[] {
  const steps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentIndex = steps.indexOf(normalizeMedicineStatus(status));
  const dateLabel = formatOrderDate(createdAt);

  return [
    { step: 'Order Placed', time: dateLabel, done: currentIndex >= 0 },
    { step: 'Confirmed', time: dateLabel, done: currentIndex >= 1 },
    { step: 'Out for Delivery', time: dateLabel, done: currentIndex >= 2 },
    {
      step: 'Delivered',
      time: status === 'delivered' ? dateLabel : 'Pending',
      done: currentIndex >= 3,
    },
  ];
}

function buildDoctorTracking(
  status?: string,
  createdAt?: string,
  consultationMode?: string,
): TrackingStep[] {
  const normalized = normalizeDoctorStatus(status);
  const dateLabel = formatOrderDate(createdAt);
  const isOnline = consultationMode === 'online';
  const consultationDone = normalized === 'delivered' || status === 'in_progress';

  return [
    { step: 'Appointment Booked', time: dateLabel, done: true },
    { step: 'Payment Confirmed', time: dateLabel, done: normalized !== 'pending' },
    {
      step: isOnline ? 'Video Consultation' : 'Clinic Visit',
      time: consultationDone ? dateLabel : 'Scheduled',
      done: consultationDone,
    },
    {
      step: 'Completed',
      time: normalized === 'delivered' ? dateLabel : 'After visit',
      done: normalized === 'delivered',
    },
  ];
}

function buildLabTracking(
  status?: string,
  collectionDate?: string,
  timeSlot?: string,
): TrackingStep[] {
  const dateLabel = formatOrderDate(collectionDate);
  const order = [
    'pending',
    'confirmed',
    'collector_assigned',
    'sample_collected',
    'testing',
    'report_uploaded',
    'completed',
  ];
  const steps = [
    { key: 'pending', step: 'Test Booked', time: dateLabel },
    { key: 'confirmed', step: 'Lab Confirmed', time: dateLabel },
    { key: 'collector_assigned', step: 'Collector Assigned', time: 'Pending' },
    {
      key: 'sample_collected',
      step: 'Sample Collected',
      time: timeSlot ? `${dateLabel} · ${timeSlot}` : dateLabel,
    },
    { key: 'testing', step: 'Testing in Lab', time: 'In progress' },
    { key: 'report_uploaded', step: 'Report Ready', time: 'Ready' },
    { key: 'completed', step: 'Completed', time: dateLabel },
  ];
  const currentIndex = order.indexOf(status || '');

  return steps.map((s, index) => ({
    step: s.step,
    time: s.time,
    done: currentIndex >= 0 ? index <= currentIndex : index === 0,
  }));
}

export function buildOrderRef(type: OrderType, id: string) {
  if (type === 'doctor') return `doc-${id}`;
  if (type === 'lab') return `lab-${id}`;
  if (type === 'prescription') return `rx-${id}`;
  return `med-${id}`;
}

export function parseOrderRef(orderRef: string): { type: OrderType; id: string } {
  if (orderRef.startsWith('doc-')) return { type: 'doctor', id: orderRef.slice(4) };
  if (orderRef.startsWith('lab-')) return { type: 'lab', id: orderRef.slice(4) };
  if (orderRef.startsWith('rx-')) {
    return { type: 'prescription', id: orderRef.slice(3) };
  }
  if (orderRef.startsWith('med-')) return { type: 'medicines', id: orderRef.slice(4) };
  return { type: 'medicines', id: orderRef };
}

export function mapMedicineOrderToFrontend(
  order: RawMedicineOrder | null | undefined,
): UnifiedOrder | null {
  if (!order?.id) return null;

  return {
    id: buildOrderRef('medicines', order.id),
    sourceId: order.id,
    type: 'medicines',
    title: 'Medicine Order',
    date: formatOrderDate(order.created_at),
    sortDate: order.created_at,
    status: normalizeMedicineStatus(order.status),
    rawStatus: order.status,
    total: order.total_amount ?? 0,
    vendor: order.vendor?.business_name || 'Pharmacy',
    items:
      order.items?.map(item => ({
        name: item.product?.name || item.name || 'Product',
        qty: item.quantity ?? 1,
        price: item.unit_price ?? item.price ?? 0,
        img: item.product?.image_url || DEFAULT_PRODUCT_IMAGE,
      })) || [],
    tracking: buildMedicineTracking(order.status, order.created_at),
    deliveryAddress: formatAddress(order.delivery_address),
  };
}

export function mapDoctorAppointmentToOrder(
  appointment: Record<string, unknown> | null | undefined,
): UnifiedOrder | null {
  if (!appointment?.id) return null;

  const doctor = appointment.doctor as Record<string, unknown> | undefined;
  const doctorName =
    (doctor?.name as string) ||
    (appointment.doctorName as string) ||
    'Doctor';
  const specialty =
    (doctor?.specialty as string) || (appointment.specialty as string);
  const consultationMode =
    (appointment.consultation_mode as string) ||
    (appointment.consultationMode as string) ||
    'in_person';
  const isOnline = consultationMode === 'online';
  const createdAt =
    (appointment.created_at as string) ||
    (appointment.appointment_date as string);
  const hospital =
    (doctor?.hospital as string) ||
    (appointment.hospital as string) ||
    'Clinic visit';

  return {
    id: buildOrderRef('doctor', String(appointment.id)),
    sourceId: String(appointment.id),
    type: 'doctor',
    title: isOnline ? 'Video Consultation' : 'Doctor Appointment',
    date: formatOrderDate(
      (appointment.appointment_date as string) || createdAt,
    ),
    sortDate: (appointment.appointment_date as string) || createdAt,
    status: normalizeDoctorStatus(appointment.status as string),
    rawStatus: appointment.status as string,
    total: (appointment.fee as number) ?? 0,
    vendor: doctorName,
    specialty,
    slot: appointment.slot as string | undefined,
    isOnline,
    consultationMode,
    isHospitalVisit: !isOnline,
    items: [
      {
        name: `${isOnline ? 'Online Consultation' : 'Clinic Appointment'} — ${doctorName}`,
        qty: 1,
        price: (appointment.fee as number) ?? 0,
        img: (doctor?.photo_url as string) || DOCTOR_IMAGE,
      },
    ],
    tracking: buildDoctorTracking(
      appointment.status as string,
      createdAt,
      consultationMode,
    ),
    deliveryAddress: isOnline ? 'Online — Video consultation' : hospital,
  };
}

export function mapLabBookingToOrder(
  booking: RawLabBooking | null | undefined,
): UnifiedOrder | null {
  if (!booking?.id) return null;

  const testName = booking.lab_test?.name || 'Lab Test';
  const createdAt = booking.collection_date;

  return {
    id: buildOrderRef('lab', booking.id),
    sourceId: booking.id,
    type: 'lab',
    title: 'Lab Test Booking',
    date: formatOrderDate(booking.collection_date || createdAt),
    sortDate: booking.collection_date,
    status: normalizeLabStatus(booking.status),
    rawStatus: booking.status,
    total: booking.price ?? 0,
    vendor: booking.lab_test?.lab || booking.lab_partner?.name || 'Lab Partner',
    testName,
    slot: booking.time_slot,
    items: [
      {
        name: testName,
        qty: 1,
        price: booking.price ?? 0,
        img: LAB_TEST_IMAGE,
      },
    ],
    tracking: buildLabTracking(
      booking.status,
      booking.collection_date,
      booking.time_slot,
    ),
    deliveryAddress: formatAddress(booking.collection_address),
    reportUrl: booking.report_url,
  };
}

export function mapPrescriptionOrderToOrder(
  order: RawPrescriptionOrder | null | undefined,
): UnifiedOrder | null {
  const mapped = mapPrescriptionOrderToFrontend(order);
  if (!mapped) return null;

  const vendorName =
    mapped.assignedVendor?.name ||
    mapped.currentVendor?.name ||
    (mapped.status === 'no_vendor' ? 'No pharmacy accepted' : 'Finding pharmacy...');

  return {
    id: buildOrderRef('prescription', mapped.id),
    sourceId: mapped.id,
    type: 'prescription',
    title: 'Prescription Request',
    date: formatOrderDate(mapped.createdAt),
    sortDate: mapped.createdAt,
    status: normalizePrescriptionStatus(mapped.status),
    rawStatus: mapped.status,
    statusLabel: mapped.statusLabel,
    total: mapped.estimatedValue,
    vendor: vendorName,
    items: mapped.items.map(item => ({
      name: item.name,
      qty: item.quantity,
      price: item.unitPrice,
      img: DEFAULT_PRODUCT_IMAGE,
    })),
    tracking: mapped.statusTimeline,
    deliveryAddress: mapped.deliveryAddress,
    fileUrl: mapped.fileUrl,
  };
}

export function mergeAllOrders(
  medicineOrders: RawMedicineOrder[] = [],
  appointments: Record<string, unknown>[] = [],
  labBookings: RawLabBooking[] = [],
  prescriptionOrders: RawPrescriptionOrder[] = [],
): UnifiedOrder[] {
  const merged = [
    ...medicineOrders.map(mapMedicineOrderToFrontend).filter(Boolean),
    ...appointments.map(mapDoctorAppointmentToOrder).filter(Boolean),
    ...labBookings.map(mapLabBookingToOrder).filter(Boolean),
    ...prescriptionOrders.map(mapPrescriptionOrderToOrder).filter(Boolean),
  ] as UnifiedOrder[];

  return merged.sort(
    (a, b) =>
      new Date(b.sortDate || 0).getTime() - new Date(a.sortDate || 0).getTime(),
  );
}

/** @deprecated use UnifiedOrder */
export type MedicineOrder = UnifiedOrder;

export function mapOrdersToFrontend(orders: RawMedicineOrder[] = []): UnifiedOrder[] {
  return orders
    .map(mapMedicineOrderToFrontend)
    .filter((item): item is UnifiedOrder => Boolean(item));
}

export function mapMedicineOrderToFrontendLegacy(order: RawMedicineOrder) {
  return mapMedicineOrderToFrontend(order);
}
