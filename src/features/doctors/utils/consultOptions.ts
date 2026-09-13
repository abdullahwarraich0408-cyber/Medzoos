import type { Doctor } from '../../../lib/mappers/doctor';
import type { PracticeLocation } from '../../../lib/mappers/doctor';

export type ConsultOption = {
  id: string;
  type: 'online' | 'in_person';
  practiceLocationId?: string | null;
  hospitalId?: string | null;
  title: string;
  subtitle?: string;
  location?: string | null;
  fee: number;
  availability: string;
  days: string[];
  nextAvailableDate?: string | null;
};

function formatAvailabilityDate(date: Date) {
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

export function getDoctorAvailabilityLabel(doctor: Doctor): string {
  if (doctor.availableToday) return 'Available today';
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatAvailabilityDate(tomorrow);
}

function mapPracticeLocationOption(
  location: PracticeLocation,
  doctor: Doctor,
): ConsultOption {
  const hospital = location.hospitalData;
  const title = location.title || hospital?.name || location.clinicName || 'Clinic';
  const address =
    location.address ||
    (hospital?.address
      ? `${hospital.address}${hospital.city ? `, ${hospital.city}` : ''}`
      : hospital?.city || null);

  return {
    id: `in_person_${location.id}`,
    type: 'in_person',
    practiceLocationId: location.id,
    hospitalId: location.hospitalId || hospital?.id || null,
    title,
    subtitle: address || undefined,
    location: address,
    fee: location.fee ?? doctor.fee,
    availability: location.availability || getDoctorAvailabilityLabel(doctor),
    days: location.days || [],
    nextAvailableDate: location.nextAvailableDate,
  };
}

export function buildDoctorConsultOptions(
  doctor: Doctor,
  hospitalContext: string | null = null,
): ConsultOption[] {
  if (!doctor) return [];

  const options: ConsultOption[] = [];
  const practiceLocations = doctor.practiceLocations || [];

  if (doctor.online) {
    options.push({
      id: 'online',
      type: 'online',
      practiceLocationId: null,
      hospitalId: null,
      title: 'Online Video Consultation',
      subtitle: 'Video call, chat & file uploads',
      location: null,
      fee: doctor.fee,
      availability: getDoctorAvailabilityLabel(doctor),
      days: [],
    });
  }

  const inPersonLocations = practiceLocations.length
    ? practiceLocations
    : doctor.hospitalId || doctor.hospital
      ? [
          {
            id: 'legacy',
            hospitalId: doctor.hospitalId || undefined,
            title: doctor.hospitalData?.name || doctor.hospital,
            address: doctor.hospitalData?.address,
            fee: doctor.fee,
            availability: getDoctorAvailabilityLabel(doctor),
            days: [],
            hospitalData: doctor.hospitalData,
          } as PracticeLocation,
        ]
      : [];

  const mappedInPerson = inPersonLocations.map(location =>
    mapPracticeLocationOption(location, doctor),
  );

  let inPersonOptions = hospitalContext
    ? mappedInPerson.filter(
        option =>
          option.hospitalId === hospitalContext ||
          (!option.hospitalId && doctor.hospitalId === hospitalContext),
      )
    : mappedInPerson;

  // Don't block in-clinic booking if hospital filter matched nothing
  if (hospitalContext && inPersonOptions.length === 0) {
    inPersonOptions = mappedInPerson;
  }

  options.push(...inPersonOptions);

  return options;
}

export function filterConsultOptions(
  options: ConsultOption[],
  consultType: 'online' | 'in_person' | null,
): ConsultOption[] {
  if (!consultType) return options;
  return options.filter(option => option.type === consultType);
}
