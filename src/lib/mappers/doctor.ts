import { getApiBaseUrl } from '../../config/api';

export const DEFAULT_DOCTOR_PHOTO =
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export type RawPracticeLocation = {
  id?: string;
  hospital_id?: string;
  clinic_name?: string;
  title?: string;
  address?: string;
  fee?: number;
  availability?: string;
  next_available_date?: string;
  schedule?: Array<{ day?: string; slots?: string[] }>;
  hospital?: {
    id?: string;
    name?: string;
    slug?: string;
    city?: string;
    logo?: string;
    address?: string;
  };
};

export type RawDoctor = {
  id?: string;
  name?: string;
  specialty?: string;
  experience_years?: number;
  rating?: number;
  reviews_count?: number;
  fee?: number;
  online?: boolean;
  available_today?: boolean;
  languages?: string[];
  photo_url?: string;
  image?: string;
  slots?: unknown[];
  about?: string;
  qualifications?: string[];
  hospital?: string;
  hospital_id?: string;
  hospital_ref?: RawPracticeLocation['hospital'];
  practice_locations?: RawPracticeLocation[];
};

export type PracticeLocation = {
  id: string;
  hospitalId?: string;
  clinicName?: string;
  title: string;
  address?: string | null;
  fee?: number;
  days: string[];
  availability: string;
  nextAvailableDate?: string | null;
  hospitalData?: {
    id?: string;
    name?: string;
    slug?: string;
    city?: string;
    logo?: string;
    address?: string;
  } | null;
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  experienceYears: number;
  rating: number;
  reviews: number;
  fee: number;
  online: boolean;
  availableToday: boolean;
  languages: string[];
  photo: string;
  image: string;
  about?: string;
  qualifications: string[];
  hospital: string;
  hospitalId?: string | null;
  hospitalData?: PracticeLocation['hospitalData'];
  practiceLocations: PracticeLocation[];
  isIndependent: boolean;
};

export function getDoctorPhoto(photoUrl?: string): string {
  const value = photoUrl?.trim();
  if (!value) return DEFAULT_DOCTOR_PHOTO;
  if (
    value.startsWith('https://') ||
    value.startsWith('http://') ||
    value.startsWith('data:')
  ) {
    return value;
  }
  if (value.startsWith('/')) {
    const base = String(getApiBaseUrl() || '').replace(/\/api\/?$/, '');
    if (base) return `${base}${value}`;
  }
  return value;
}

function getNextAvailableFromSchedule(
  schedule: Array<{ day?: string; slots?: string[] }> = [],
) {
  const activeDays = new Set(
    schedule.filter(entry => entry.slots?.length).map(entry => entry.day),
  );
  if (!activeDays.size) return null;

  const start = new Date();
  start.setHours(12, 0, 0, 0);
  for (let offset = 0; offset < 21; offset += 1) {
    const candidate = new Date(start);
    candidate.setDate(start.getDate() + offset);
    if (activeDays.has(WEEKDAYS[candidate.getDay()])) {
      return candidate;
    }
  }
  return null;
}

function formatLocationAvailability(date: Date | null): string {
  if (!date) return 'No upcoming slots';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return 'Available today';
  if (diffDays === 1) return 'Available tomorrow';
  return `Available ${target.toLocaleDateString('en-PK', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })}`;
}

function mapPracticeLocation(location: RawPracticeLocation): PracticeLocation | null {
  if (!location) return null;
  const hospital = location.hospital;
  const schedule = Array.isArray(location.schedule) ? location.schedule : [];
  const days = schedule.filter(entry => entry.slots?.length).map(entry => entry.day!);
  const nextDate = getNextAvailableFromSchedule(schedule);

  return {
    id: location.id || 'legacy',
    hospitalId: location.hospital_id || hospital?.id,
    clinicName: location.clinic_name,
    title: location.title || hospital?.name || location.clinic_name || 'Clinic',
    address:
      location.address ||
      (hospital?.address
        ? `${hospital.address}${hospital.city ? `, ${hospital.city}` : ''}`
        : hospital?.city || null),
    fee: location.fee,
    days,
    availability:
      location.availability || formatLocationAvailability(nextDate),
    nextAvailableDate:
      location.next_available_date ||
      (nextDate ? nextDate.toISOString().slice(0, 10) : null),
    hospitalData: hospital
      ? {
          id: hospital.id,
          name: hospital.name,
          slug: hospital.slug,
          city: hospital.city,
          logo: hospital.logo,
          address: hospital.address,
        }
      : null,
  };
}

export function mapDoctorToFrontend(doctor: RawDoctor): Doctor | null {
  if (!doctor?.id && !doctor?.name) return null;

  const practiceLocations = (doctor.practice_locations || [])
    .map(mapPracticeLocation)
    .filter((item): item is PracticeLocation => Boolean(item));

  const primaryLocation = practiceLocations[0];
  const hospitalName =
    primaryLocation?.title ||
    doctor.hospital_ref?.name ||
    doctor.hospital ||
    'Independent Practice';

  const photo = getDoctorPhoto(doctor.photo_url);

  return {
    id: doctor.id || doctor.name || '',
    name: doctor.name || 'Doctor',
    specialty: doctor.specialty || 'General Physician',
    experience: `${doctor.experience_years ?? 0} years`,
    experienceYears: doctor.experience_years ?? 0,
    rating: doctor.rating ?? 4.8,
    reviews: doctor.reviews_count ?? 0,
    fee: doctor.fee ?? 1500,
    online: Boolean(doctor.online),
    availableToday: Boolean(doctor.available_today),
    languages: Array.isArray(doctor.languages) ? doctor.languages : [],
    photo,
    image: doctor.image || photo,
    about: doctor.about,
    qualifications: Array.isArray(doctor.qualifications)
      ? doctor.qualifications
      : [],
    hospital: hospitalName,
    hospitalId:
      primaryLocation?.hospitalId ||
      doctor.hospital_id ||
      doctor.hospital_ref?.id ||
      null,
    hospitalData:
      primaryLocation?.hospitalData ||
      (doctor.hospital_ref
        ? {
            id: doctor.hospital_ref.id,
            name: doctor.hospital_ref.name,
            slug: doctor.hospital_ref.slug,
            city: doctor.hospital_ref.city,
            logo: doctor.hospital_ref.logo,
            address: doctor.hospital_ref.address,
          }
        : null),
    practiceLocations,
    isIndependent: practiceLocations.length === 0 && !doctor.hospital_id,
  };
}

export function mapDoctorsToFrontend(doctors: RawDoctor[] = []): Doctor[] {
  return doctors
    .map(mapDoctorToFrontend)
    .filter((item): item is Doctor => Boolean(item));
}

export function formatConsultations(reviews: number): string {
  const count = Math.max(reviews * 6, 100);
  if (count >= 1000) {
    const value = count / 1000;
    return `${Number.isInteger(value) ? value : value.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(count);
}

export type DoctorAppointment = {
  id: string;
  doctorId?: string;
  doctorName?: string;
  specialty?: string;
  doctorPhoto?: string;
  hospital?: string;
  slot?: string;
  date: string;
  dateIso?: string;
  fee?: number;
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  reason?: string;
  consultationMode?: string | null;
  preferredMode?: string | null;
  needsModeSelection: boolean;
  isOnline: boolean;
  isInPerson: boolean;
  meetingId?: string;
  meetingUrl?: string;
  consultationNotes?: string;
  prescription?: Record<string, unknown> | null;
  review?: Record<string, unknown> | null;
  canReview: boolean;
  canJoin: boolean;
  canChat: boolean;
  canViewChat: boolean;
  chatReadOnly: boolean;
  raw: Record<string, unknown>;
};

function resolveIsOnlineAppointment(appointment: Record<string, unknown>) {
  const consultationMode = (appointment.consultation_mode as string) || null;
  const preferredMode =
    (appointment.preferred_consultation_mode as string) || null;
  if (consultationMode === 'in_person') return false;
  if (consultationMode === 'online') return true;
  if (preferredMode === 'online') return true;
  return Boolean(appointment.meeting_id);
}

export function mapDoctorAppointmentToFrontend(
  appointment: Record<string, unknown> | null | undefined,
): DoctorAppointment | null {
  if (!appointment?.id) return null;

  const doctor = appointment.doctor as Record<string, unknown> | undefined;
  const date = appointment.appointment_date
    ? new Date(String(appointment.appointment_date))
    : null;
  const consultationMode =
    (appointment.consultation_mode as string) || null;
  const preferredMode =
    (appointment.preferred_consultation_mode as string) || null;
  const isOnline = resolveIsOnlineAppointment(appointment);
  const status = String(appointment.status || '');
  const needsModeSelection =
    status === 'confirmed' && !consultationMode && !preferredMode;
  const activeStatuses = ['confirmed', 'in_progress'];
  const chatStatuses = ['confirmed', 'in_progress', 'completed'];
  const hasMeeting = Boolean(appointment.meeting_id);

  return {
    id: String(appointment.id),
    doctorId: (appointment.doctor_id as string) || (doctor?.id as string),
    doctorName: doctor?.name as string | undefined,
    specialty: doctor?.specialty as string | undefined,
    doctorPhoto: getDoctorPhoto(doctor?.photo_url as string | undefined),
    hospital: doctor?.hospital as string | undefined,
    slot: appointment.slot as string | undefined,
    date: date
      ? date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '',
    dateIso: appointment.appointment_date as string | undefined,
    fee: appointment.fee as number | undefined,
    status,
    paymentMethod: appointment.payment_method as string | undefined,
    paymentStatus: appointment.payment_status as string | undefined,
    reason: appointment.reason as string | undefined,
    consultationMode,
    preferredMode,
    needsModeSelection,
    isOnline,
    isInPerson: consultationMode === 'in_person',
    meetingId: appointment.meeting_id as string | undefined,
    meetingUrl: appointment.meeting_url as string | undefined,
    consultationNotes: appointment.consultation_notes as string | undefined,
    prescription: (appointment.prescription as Record<string, unknown>) || null,
    review: (appointment.review as Record<string, unknown>) || null,
    canReview: status === 'completed' && !appointment.review,
    canJoin:
      activeStatuses.includes(status) &&
      isOnline &&
      !needsModeSelection &&
      hasMeeting,
    canChat:
      chatStatuses.includes(status) && isOnline && !needsModeSelection,
    canViewChat:
      status !== 'cancelled' &&
      isOnline &&
      (chatStatuses.includes(status) ||
        (status === 'pending' && preferredMode === 'online')),
    chatReadOnly: status === 'completed',
    raw: appointment,
  };
}

export function mapDoctorAppointmentsToFrontend(
  appointments: Record<string, unknown>[] = [],
): DoctorAppointment[] {
  return appointments
    .map(mapDoctorAppointmentToFrontend)
    .filter((item): item is DoctorAppointment => Boolean(item));
}
