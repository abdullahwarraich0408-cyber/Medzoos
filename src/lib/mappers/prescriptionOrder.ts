export type RawPrescriptionOrder = {
  id?: string;
  status?: string;
  file_url?: string;
  delivery_address?: string | { street?: string; city?: string; address?: string };
  delivery_type?: string;
  estimated_value?: number;
  medicine_count?: number;
  created_at?: string;
  items?: Array<{
    id?: string;
    name?: string;
    quantity?: number;
    unit_price?: number;
    availability?: string;
  }>;
  assignment_logs?: Array<{
    id?: string;
    vendor_id?: string;
    action?: string;
    created_at?: string;
    vendor?: { business_name?: string };
  }>;
  current_vendor?: { id?: string; business_name?: string };
  assigned_vendor?: { id?: string; business_name?: string };
};

export const PRESCRIPTION_STATUS_LABELS: Record<string, string> = {
  finding_vendor: 'Finding pharmacy',
  awaiting_accept: 'Waiting for pharmacy',
  accepted: 'Pharmacy accepted',
  stock_pending: 'Checking stock',
  stock_confirmed: 'Stock confirmed',
  customer_review: 'Review required',
  confirmed: 'Confirmed',
  packed: 'Packed',
  rider_assigned: 'Rider assigned',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  no_vendor: 'No pharmacy available',
};

function formatDateTime(dateString?: string) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export type PrescriptionOrder = {
  id: string;
  shortId: string;
  fileUrl?: string;
  deliveryAddress: string;
  status: string;
  statusLabel: string;
  estimatedValue: number;
  medicineCount: number;
  createdAt?: string;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  statusTimeline: Array<{ step: string; time: string; done: boolean }>;
  assignedVendor?: { name: string } | null;
  currentVendor?: { name: string } | null;
};

export function mapPrescriptionOrderToFrontend(
  order: RawPrescriptionOrder | null | undefined,
): PrescriptionOrder | null {
  if (!order?.id) return null;

  const items = (order.items || []).map(item => ({
    name: item.name || 'Medicine',
    quantity: item.quantity ?? 1,
    unitPrice: item.unit_price ?? 0,
  }));

  const created = formatDateTime(order.created_at);

  return {
    id: order.id,
    shortId: `#P${String(order.id).slice(0, 6).toUpperCase()}`,
    fileUrl: order.file_url,
    deliveryAddress:
      typeof order.delivery_address === 'string'
        ? order.delivery_address
        : order.delivery_address?.street ||
          order.delivery_address?.address ||
          'Address on file',
    status: order.status || 'finding_vendor',
    statusLabel:
      PRESCRIPTION_STATUS_LABELS[order.status || ''] || order.status || 'Pending',
    estimatedValue: order.estimated_value ?? 0,
    medicineCount: order.medicine_count || items.length,
    createdAt: order.created_at,
    items,
    statusTimeline: [
      { step: 'Prescription uploaded', time: created, done: true },
      {
        step: PRESCRIPTION_STATUS_LABELS[order.status || ''] || 'Processing',
        time: 'In progress',
        done: order.status === 'delivered',
      },
    ],
    assignedVendor: order.assigned_vendor
      ? { name: order.assigned_vendor.business_name || 'Pharmacy' }
      : null,
    currentVendor: order.current_vendor
      ? { name: order.current_vendor.business_name || 'Pharmacy' }
      : null,
  };
}
