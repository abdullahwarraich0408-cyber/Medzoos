/**
 * Shared appointment journey helpers (presentation only — no new status machine).
 */

type AppointmentLike = Record<string, unknown> | null | undefined;

export type TimelineStepState =
  | 'completed'
  | 'current'
  | 'upcoming'
  | 'terminated';

export type TimelineStep = {
  id: string;
  label: string;
  state: TimelineStepState;
};

export function normalizeMode(appointment: AppointmentLike) {
  const mode = String(
    appointment?.consultationMode ||
      appointment?.consultation_mode ||
      appointment?.preferredMode ||
      appointment?.preferred_consultation_mode ||
      '',
  ).toLowerCase();
  if (mode === 'in_person' || mode === 'in_clinic') return 'in_person';
  if (mode === 'online') return 'online';
  if (appointment?.isInPerson) return 'in_person';
  if (appointment?.isOnline) return 'online';
  return 'online';
}

export function formatAppointmentStatusLabel(status?: string | null) {
  const map: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    checked_in: 'Checked In',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'Missed Appointment',
  };
  return map[String(status || '')] || String(status || '').replace(/_/g, ' ');
}

export function formatPaymentLabel(appointment: AppointmentLike) {
  const status = String(
    appointment?.paymentStatus || appointment?.payment_status || '',
  ).toLowerCase();
  const method = String(
    appointment?.paymentMethod || appointment?.payment_method || '',
  ).toLowerCase();

  if (status === 'paid') {
    if (method === 'pay_at_clinic' || method === 'cod' || method === 'cash') {
      return 'Paid at Clinic';
    }
    return 'Paid Online';
  }
  if (status === 'pay_at_clinic') return 'Pay at Clinic';
  if (status === 'pending') return 'Payment Pending';
  if (status === 'failed') return 'Payment Failed';
  if (status === 'refunded') return 'Refunded';
  if (status === 'partially_refunded') return 'Partially Refunded';
  return status ? status.replace(/_/g, ' ') : 'Payment Pending';
}

export function formatFollowUpStatusLabel(status?: string | null) {
  const map: Record<string, string> = {
    planned: 'Follow-up Recommended',
    notified: 'Follow-up Recommended',
    booked: 'Follow-up Booked',
    needs_rebooking: 'Follow-up Needs Rebooking',
    overdue: 'Follow-up Overdue',
    completed: 'Follow-up Completed',
    cancelled: 'Follow-up Cancelled',
    declined: 'Follow-up Declined',
  };
  return map[String(status || '')] || String(status || '').replace(/_/g, ' ');
}

function paymentStepDone(appointment: AppointmentLike) {
  const status = String(
    appointment?.paymentStatus || appointment?.payment_status || '',
  ).toLowerCase();
  return status === 'paid' || status === 'pay_at_clinic';
}

function hasPrescription(appointment: AppointmentLike) {
  const raw = appointment?.raw;
  const rawPrescription =
    raw && typeof raw === 'object'
      ? (raw as Record<string, unknown>).prescription
      : undefined;
  return Boolean(appointment?.prescription || rawPrescription);
}

export function buildPatientTimeline(
  appointment: AppointmentLike,
  options: { followUp?: unknown } = {},
): TimelineStep[] {
  const status = String(appointment?.status || '').toLowerCase();
  const mode = normalizeMode(appointment);
  const terminal = status === 'cancelled' || status === 'no_show';
  const followUp = options.followUp || null;
  const hasFollowUp = Boolean(followUp);
  const chatAvailable = Boolean(
    appointment?.canChat || appointment?.canViewChat,
  );
  const joinAvailable = Boolean(appointment?.canJoin);

  const steps =
    mode === 'in_person'
      ? [
          { id: 'booked', label: 'Booking received' },
          { id: 'payment', label: 'Payment / Pay at Clinic' },
          { id: 'confirmed', label: 'Doctor confirmed' },
          { id: 'prepare', label: 'Prepare for clinic visit' },
          { id: 'checked_in', label: 'Checked in' },
          { id: 'in_progress', label: 'Consultation in progress' },
          { id: 'completed', label: 'Completed' },
          { id: 'prescription', label: 'Prescription ready' },
          ...(hasFollowUp
            ? [{ id: 'follow_up', label: 'Follow-up recommended' }]
            : []),
        ]
      : [
          { id: 'booked', label: 'Booking received' },
          { id: 'payment', label: 'Payment' },
          { id: 'confirmed', label: 'Doctor confirmed' },
          { id: 'prepare', label: 'Prepare for consultation' },
          { id: 'chat', label: 'Chat available' },
          { id: 'join', label: 'Join available' },
          { id: 'in_progress', label: 'Consultation in progress' },
          { id: 'completed', label: 'Completed' },
          { id: 'prescription', label: 'Prescription ready' },
          ...(hasFollowUp
            ? [{ id: 'follow_up', label: 'Follow-up recommended' }]
            : []),
        ];

  let currentId = 'booked';
  if (terminal) {
    currentId = 'confirmed';
  } else if (status === 'pending') {
    currentId = paymentStepDone(appointment) ? 'confirmed' : 'payment';
  } else if (status === 'confirmed') {
    if (mode === 'online') {
      if (joinAvailable) currentId = 'join';
      else if (chatAvailable) currentId = 'chat';
      else currentId = 'prepare';
    } else {
      currentId = 'prepare';
    }
  } else if (status === 'checked_in') {
    currentId = 'checked_in';
  } else if (status === 'in_progress') {
    currentId = 'in_progress';
  } else if (status === 'completed') {
    if (hasFollowUp) currentId = 'follow_up';
    else if (hasPrescription(appointment)) currentId = 'prescription';
    else currentId = 'completed';
  }

  const currentIndex = steps.findIndex(s => s.id === currentId);

  return steps.map((step, index) => {
    if (terminal) {
      const terminateAt = steps.findIndex(s => s.id === 'confirmed');
      if (index <= Math.max(terminateAt, 1)) {
        return {
          ...step,
          state: (index < terminateAt
            ? 'completed'
            : 'terminated') as TimelineStepState,
        };
      }
      return { ...step, state: 'upcoming' as const };
    }
    if (index < currentIndex) return { ...step, state: 'completed' as const };
    if (index === currentIndex) return { ...step, state: 'current' as const };
    if (step.id === 'payment' && paymentStepDone(appointment)) {
      return { ...step, state: 'completed' as const };
    }
    if (
      step.id === 'prescription' &&
      hasPrescription(appointment) &&
      status === 'completed'
    ) {
      return { ...step, state: 'completed' as const };
    }
    return { ...step, state: 'upcoming' as const };
  });
}
