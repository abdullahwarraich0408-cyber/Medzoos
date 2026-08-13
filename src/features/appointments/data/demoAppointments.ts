import type { AppointmentCardModel } from '../components/AppointmentCard';
import {
  DEMO_APPOINTMENT_DETAILS,
  type DemoAppointmentDetail,
} from './demoAppointmentDetails';

export { localDayKey } from './localDay';

export type DemoAppointment = AppointmentCardModel & { dayKey: string };

function toCard(detail: DemoAppointmentDetail): DemoAppointment {
  const done = detail.tasks.filter(t => t.done).length;
  return {
    id: detail.id,
    sourceId: detail.sourceId,
    doctorName: detail.doctorName,
    specialty: detail.specialty,
    rating: detail.rating,
    reviews: detail.reviews,
    callType: detail.callType,
    image: detail.image,
    tasksDone: done,
    tasksTotal: detail.tasks.length,
    slot: detail.slot,
    dayKey: detail.dayKey,
  };
}

/** Placeholder appointments until real bookings are wired. */
export const DEMO_APPOINTMENTS: DemoAppointment[] = Object.values(
  DEMO_APPOINTMENT_DETAILS,
).map(toCard);

export const DEMO_SAVED_DOCTORS: AppointmentCardModel[] = DEMO_APPOINTMENTS.slice(
  0,
  3,
);
