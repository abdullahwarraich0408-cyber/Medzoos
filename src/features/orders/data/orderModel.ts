import type { UnifiedOrder } from '../../../lib/mappers/order';

export type HubOrderType =
  | 'medicine_order'
  | 'lab_test'
  | 'doctor_appointment'
  | 'hospital_booking'
  | 'prescription_request';

export type HubOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'sample_collected'
  | 'processing'
  | 'report_ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'
  | 'under_review';

export type OrderLifecycleTab = 'active' | 'completed' | 'cancelled';

export type OrderTypeFilter =
  | 'all'
  | 'medicines'
  | 'labs'
  | 'doctors'
  | 'hospitals'
  | 'prescriptions';

export const ORDER_LIFECYCLE_TABS: { id: OrderLifecycleTab; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export const ORDER_TYPE_FILTERS: { id: OrderTypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'medicines', label: 'Medicines' },
  { id: 'labs', label: 'Labs' },
  { id: 'doctors', label: 'Doctors' },
  { id: 'hospitals', label: 'Hospitals' },
  { id: 'prescriptions', label: 'Prescriptions' },
];

export type HubOrderView = {
  orderId: string;
  patientId?: string;
  orderType: HubOrderType;
  title: string;
  providerName: string;
  status: HubOrderStatus;
  statusLabel: string;
  nextStep: string;
  date: string;
  time?: string;
  amount?: number;
  paymentStatus?: string;
  items: string[];
  progressSteps: { step: string; time: string; done: boolean }[];
  currentStep: number;
  canCancel: boolean;
  canReschedule: boolean;
  canChat: boolean;
  invoiceUrl?: string;
  reportUrl?: string;
  prescriptionId?: string;
  deliveryAddress?: string;
  specialty?: string;
  testName?: string;
  actionLabel: string;
  refundStatus?: string;
  cancelReason?: string;
  sortDate: string;
  icon: string;
  lifecycle: OrderLifecycleTab;
  sourceOrder: UnifiedOrder;
};

const ACTIVE_STATUSES: HubOrderStatus[] = [
  'pending',
  'confirmed',
  'in_progress',
  'sample_collected',
  'processing',
  'report_ready',
  'out_for_delivery',
  'under_review',
];

function formatOrderRef(id: string) {
  const parts = id.split('-');
  if (parts.length >= 2 && parts[1]) {
    return `#${parts[1].slice(0, 8).toUpperCase()}`;
  }
  return `#${id.slice(0, 8).toUpperCase()}`;
}

function mapUnifiedStatus(order: UnifiedOrder): HubOrderStatus {
  const raw = order.rawStatus || order.status;
  if (order.status === 'cancelled' || raw === 'cancelled') return 'cancelled';
  if (order.status === 'delivered') return 'completed';

  if (order.type === 'lab') {
    if (raw === 'sample_collected') return 'sample_collected';
    if (raw === 'report_uploaded' || raw === 'completed') return 'report_ready';
    if (order.status === 'processing') return 'processing';
    return 'pending';
  }

  if (order.type === 'prescription') {
    if (['finding_vendor', 'awaiting_accept'].includes(raw || '')) return 'under_review';
    if (order.status === 'shipped') return 'out_for_delivery';
    if (order.status === 'processing') return 'confirmed';
    return 'under_review';
  }

  if (order.type === 'doctor') {
    if (raw === 'confirmed') return 'confirmed';
    if (raw === 'in_progress') return 'in_progress';
    if (raw === 'completed') return 'completed';
    return 'pending';
  }

  if (order.status === 'shipped') return 'out_for_delivery';
  if (order.status === 'processing') return 'confirmed';
  return 'pending';
}

function getLifecycle(status: HubOrderStatus): OrderLifecycleTab {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'completed') return 'completed';
  return 'active';
}

function getOrderType(order: UnifiedOrder): HubOrderType {
  if (order.type === 'medicines') return 'medicine_order';
  if (order.type === 'lab') return 'lab_test';
  if (order.type === 'prescription') return 'prescription_request';
  if (order.isHospitalVisit) return 'hospital_booking';
  return 'doctor_appointment';
}

function getTitle(order: UnifiedOrder, orderType: HubOrderType): string {
  if (orderType === 'doctor_appointment') return 'Doctor Appointment';
  if (orderType === 'hospital_booking') return 'Hospital Booking';
  if (orderType === 'lab_test') return 'Lab Test';
  if (orderType === 'prescription_request') return 'Prescription Request';
  if (order.items.length > 1) {
    const first = order.items[0]?.name || 'Medicine';
    return `Medicine Order`;
  }
  return 'Medicine Order';
}

function getItemsSummary(order: UnifiedOrder): string[] {
  return order.items.map(i => i.name);
}

function getMedicineTitleSummary(order: UnifiedOrder): string {
  if (order.items.length === 0) return 'Medicine Order';
  const first = order.items[0].name;
  if (order.items.length === 1) return first;
  return `${first} and ${order.items.length - 1} item${order.items.length - 1 === 1 ? '' : 's'}`;
}

function getNextStep(order: UnifiedOrder, status: HubOrderStatus): string {
  if (status === 'cancelled') return 'Order cancelled';
  if (status === 'completed') return 'Order completed';

  if (order.type === 'doctor') {
    if (status === 'pending') return 'Waiting for confirmation';
    if (status === 'confirmed') return 'Join or visit clinic';
    if (status === 'in_progress') return 'Consultation in progress';
    return 'Appointment scheduled';
  }

  if (order.type === 'lab') {
    if (status === 'sample_collected') return 'Report expected today';
    if (status === 'processing') return 'Lab processing your sample';
    if (status === 'report_ready') return 'Report is ready';
    return 'Awaiting sample collection';
  }

  if (order.type === 'medicines') {
    if (status === 'out_for_delivery') return 'Arriving today';
    if (status === 'confirmed' || status === 'in_progress') return 'Pharmacy preparing order';
    return 'Order placed';
  }

  if (order.type === 'prescription') {
    return 'Pharmacist verification';
  }

  return 'Track your order';
}

function getActionLabel(orderType: HubOrderType, status: HubOrderStatus): string {
  if (status === 'completed') return 'View invoice';
  if (status === 'cancelled') return 'View details';
  if (orderType === 'medicine_order' && status === 'out_for_delivery') return 'Track order';
  if (orderType === 'lab_test') return 'Track';
  if (orderType === 'prescription_request') return 'View';
  return 'View details';
}

function getStatusLabel(status: HubOrderStatus): string {
  const labels: Record<HubOrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    in_progress: 'In progress',
    sample_collected: 'Sample collected',
    processing: 'Processing',
    report_ready: 'Report ready',
    out_for_delivery: 'Out for delivery',
    completed: 'Completed',
    cancelled: 'Cancelled',
    under_review: 'Under review',
  };
  return labels[status];
}

function getIcon(orderType: HubOrderType): string {
  switch (orderType) {
    case 'medicine_order':
      return 'pill';
    case 'lab_test':
      return 'flask-outline';
    case 'doctor_appointment':
      return 'stethoscope';
    case 'hospital_booking':
      return 'hospital-building';
    case 'prescription_request':
      return 'file-document-outline';
    default:
      return 'package-variant';
  }
}

function buildProgressSteps(order: UnifiedOrder, orderType: HubOrderType) {
  if (orderType === 'medicine_order') {
    const steps = ['Placed', 'Confirmed', 'Packed', 'Out for delivery', 'Delivered'];
    const status = mapUnifiedStatus(order);
    const index =
      status === 'out_for_delivery'
        ? 3
        : status === 'confirmed' || status === 'in_progress'
          ? 2
          : status === 'completed'
            ? 4
            : 1;
    return steps.map((step, i) => ({
      step,
      time: order.date,
      done: i <= index,
    }));
  }

  if (orderType === 'lab_test') {
    const steps = ['Booked', 'Sample collected', 'Processing', 'Report ready'];
    const status = mapUnifiedStatus(order);
    const index =
      status === 'report_ready'
        ? 3
        : status === 'processing'
          ? 2
          : status === 'sample_collected'
            ? 1
            : 0;
    return steps.map((step, i) => ({
      step,
      time: order.date,
      done: i <= index,
    }));
  }

  if (orderType === 'doctor_appointment' || orderType === 'hospital_booking') {
    const steps = ['Booked', 'Confirmed', 'Consultation completed'];
    const status = mapUnifiedStatus(order);
    const index =
      status === 'completed' ? 2 : status === 'confirmed' || status === 'in_progress' ? 1 : 0;
    return steps.map((step, i) => ({
      step,
      time: order.date,
      done: i <= index,
    }));
  }

  const steps = ['Uploaded', 'Under review', 'Verified', 'Ready to order'];
  const status = mapUnifiedStatus(order);
  const index =
    status === 'out_for_delivery' || status === 'confirmed'
      ? 3
      : status === 'under_review'
        ? 1
        : 0;
  return steps.map((step, i) => ({
    step,
    time: order.date,
    done: i <= index,
  }));
}

export function buildHubOrderFromUnified(order: UnifiedOrder): HubOrderView {
  const orderType = getOrderType(order);
  const status = mapUnifiedStatus(order);
  const lifecycle = getLifecycle(status);
  let title = getTitle(order, orderType);

  if (orderType === 'medicine_order') {
    title = 'Medicine Order';
  }

  let providerName = order.vendor;
  if (orderType === 'medicine_order') {
    providerName = getMedicineTitleSummary(order);
  } else if (orderType === 'lab_test' && order.testName) {
    providerName = `${order.testName} · ${order.vendor}`;
  }

  return {
    orderId: order.id,
    orderType,
    title,
    providerName,
    status,
    statusLabel: getStatusLabel(status),
    nextStep: getNextStep(order, status),
    date: order.date,
    time: order.slot,
    amount: order.total > 0 ? order.total : undefined,
    items: getItemsSummary(order),
    progressSteps: buildProgressSteps(order, orderType),
    currentStep: order.tracking?.filter(s => s.done).length ?? 0,
    canCancel: lifecycle === 'active' && status !== 'out_for_delivery',
    canReschedule: order.type === 'doctor' && lifecycle === 'active',
    canChat: order.type === 'doctor' && order.isOnline === true && lifecycle === 'active',
    reportUrl: order.reportUrl,
    deliveryAddress: order.deliveryAddress,
    specialty: order.specialty,
    testName: order.testName,
    actionLabel: getActionLabel(orderType, status),
    refundStatus:
      status === 'cancelled'
        ? order.total > 0
          ? 'Refund processed'
          : undefined
        : undefined,
    cancelReason:
      status === 'cancelled' ? 'Cancelled by patient' : undefined,
    sortDate: order.sortDate || order.date,
    icon: getIcon(orderType),
    lifecycle,
    sourceOrder: order,
  };
}

export const DEMO_UNIFIED_ORDERS: UnifiedOrder[] = [
  {
    id: 'doc-DF9D5566',
    sourceId: 'DF9D5566',
    type: 'doctor',
    title: 'Doctor Appointment',
    date: 'Jul 13, 2026',
    sortDate: '2026-07-13',
    status: 'pending',
    rawStatus: 'pending',
    total: 2500,
    vendor: 'Dr. Hassan Ali',
    specialty: 'Cardiologist',
    slot: '10:30 AM',
    isOnline: false,
    isHospitalVisit: false,
    items: [{ name: 'Clinic Appointment — Dr. Hassan Ali', qty: 1, price: 2500, img: '' }],
    tracking: [
      { step: 'Appointment Booked', time: 'Jul 13, 2026', done: true },
      { step: 'Payment Confirmed', time: 'Pending', done: false },
    ],
    deliveryAddress: 'City Hospital Clinic',
  },
  {
    id: 'doc-SARA0907',
    sourceId: 'SARA0907',
    type: 'doctor',
    title: 'Doctor Appointment',
    date: 'Jul 9, 2026',
    sortDate: '2026-07-09',
    status: 'processing',
    rawStatus: 'confirmed',
    total: 2000,
    vendor: 'Dr. Sara Ahmed',
    specialty: 'Dermatologist',
    slot: '2:00 PM',
    isOnline: true,
    isHospitalVisit: false,
    items: [{ name: 'Video Consultation — Dr. Sara Ahmed', qty: 1, price: 2000, img: '' }],
    tracking: [
      { step: 'Appointment Booked', time: 'Jul 9, 2026', done: true },
      { step: 'Payment Confirmed', time: 'Jul 9, 2026', done: true },
    ],
    deliveryAddress: 'Online — Video consultation',
  },
  {
    id: 'lab-LAB2041',
    sourceId: 'LAB2041',
    type: 'lab',
    title: 'Lab Test',
    date: 'Jul 12, 2026',
    sortDate: '2026-07-12',
    status: 'processing',
    rawStatus: 'sample_collected',
    total: 1800,
    vendor: 'Chughtai Lab',
    testName: 'CBC Test',
    items: [{ name: 'CBC Test', qty: 1, price: 1800, img: '' }],
    tracking: [
      { step: 'Test Booked', time: 'Jul 12, 2026', done: true },
      { step: 'Sample Collected', time: 'Jul 12, 2026', done: true },
    ],
    deliveryAddress: 'Home sample collection',
  },
  {
    id: 'med-MED7782',
    sourceId: 'MED7782',
    type: 'medicines',
    title: 'Medicine Order',
    date: 'Jul 13, 2026',
    sortDate: '2026-07-13',
    status: 'shipped',
    rawStatus: 'shipped',
    total: 650,
    vendor: 'Zubair Pharmacy',
    items: [
      { name: 'Amoxil 500mg', qty: 1, price: 420, img: '' },
      { name: 'Vitamin C', qty: 1, price: 120, img: '' },
      { name: 'Zinc tablets', qty: 1, price: 110, img: '' },
    ],
    tracking: [
      { step: 'Order Placed', time: 'Jul 13, 2026', done: true },
      { step: 'Confirmed', time: 'Jul 13, 2026', done: true },
      { step: 'Out for Delivery', time: 'Jul 13, 2026', done: true },
    ],
    deliveryAddress: 'DHA Phase 6, Karachi',
  },
  {
    id: 'med-MED9901',
    sourceId: 'MED9901',
    type: 'medicines',
    title: 'Medicine Order',
    date: 'Jun 28, 2026',
    sortDate: '2026-06-28',
    status: 'delivered',
    rawStatus: 'delivered',
    total: 890,
    vendor: 'Sehat Pharmacy',
    items: [
      { name: 'Panadol Extra', qty: 2, price: 320, img: '' },
      { name: 'ORS Sachets', qty: 1, price: 250, img: '' },
    ],
    tracking: [],
    deliveryAddress: 'Gulshan, Karachi',
  },
  {
    id: 'lab-LAB8890',
    sourceId: 'LAB8890',
    type: 'lab',
    title: 'Lab Test',
    date: 'Jun 20, 2026',
    sortDate: '2026-06-20',
    status: 'delivered',
    rawStatus: 'completed',
    total: 2200,
    vendor: 'Excel Lab',
    testName: 'Lipid Profile',
    items: [{ name: 'Lipid Profile', qty: 1, price: 2200, img: '' }],
    tracking: [],
    deliveryAddress: 'Lab visit',
    reportUrl: 'https://example.com/report.pdf',
  },
  {
    id: 'doc-CAN1122',
    sourceId: 'CAN1122',
    type: 'doctor',
    title: 'Doctor Appointment',
    date: 'Jul 1, 2026',
    sortDate: '2026-07-01',
    status: 'cancelled',
    rawStatus: 'cancelled',
    total: 1500,
    vendor: 'Dr. Imran Khan',
    specialty: 'General Physician',
    slot: '11:00 AM',
    isOnline: false,
    isHospitalVisit: false,
    items: [{ name: 'Clinic Appointment — Dr. Imran Khan', qty: 1, price: 1500, img: '' }],
    tracking: [],
    deliveryAddress: 'Medicare Clinic',
  },
  {
    id: 'rx-RX1307',
    sourceId: 'RX1307',
    type: 'prescription',
    title: 'Prescription Request',
    date: 'Jul 13, 2026',
    sortDate: '2026-07-13',
    status: 'pending',
    rawStatus: 'finding_vendor',
    statusLabel: 'Under review',
    total: 0,
    vendor: 'Uploaded prescription',
    items: [{ name: 'Prescription upload', qty: 1, price: 0, img: '' }],
    tracking: [
      { step: 'Uploaded', time: 'Jul 13, 2026', done: true },
      { step: 'Under review', time: 'Today', done: true },
    ],
    deliveryAddress: 'DHA Phase 6, Karachi',
    fileUrl: 'https://example.com/rx.pdf',
  },
];

export function buildHubOrders(orders: UnifiedOrder[]): HubOrderView[] {
  return orders.map(buildHubOrderFromUnified);
}

export function filterByLifecycle(orders: HubOrderView[], tab: OrderLifecycleTab) {
  return orders.filter(o => o.lifecycle === tab);
}

export function filterByType(orders: HubOrderView[], filter: OrderTypeFilter) {
  if (filter === 'all') return orders;
  if (filter === 'medicines') return orders.filter(o => o.orderType === 'medicine_order');
  if (filter === 'labs') return orders.filter(o => o.orderType === 'lab_test');
  if (filter === 'doctors') return orders.filter(o => o.orderType === 'doctor_appointment');
  if (filter === 'hospitals') return orders.filter(o => o.orderType === 'hospital_booking');
  if (filter === 'prescriptions') {
    return orders.filter(o => o.orderType === 'prescription_request');
  }
  return orders;
}

export function searchHubOrders(orders: HubOrderView[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return orders;
  return orders.filter(
    o =>
      o.title.toLowerCase().includes(q) ||
      o.providerName.toLowerCase().includes(q) ||
      o.orderId.toLowerCase().includes(q) ||
      o.items.some(i => i.toLowerCase().includes(q)),
  );
}

export function formatHubOrderRef(orderId: string) {
  return formatOrderRef(orderId);
}

export function getStatusBadgeColor(status: HubOrderStatus): string {
  switch (status) {
    case 'pending':
    case 'under_review':
      return '#D97706';
    case 'confirmed':
    case 'in_progress':
    case 'processing':
      return '#113D63';
    case 'sample_collected':
    case 'report_ready':
      return '#2563EB';
    case 'out_for_delivery':
      return '#6366F1';
    case 'completed':
      return '#059669';
    case 'cancelled':
      return '#DC2626';
    default:
      return '#113D63';
  }
}
