import type { AppointmentCardModel } from '../components/AppointmentCard';
import { localDayKey } from './localDay';

export type DemoPreVisitTask = {
  id: string;
  title: string;
  subtitle: string;
  done: boolean;
};

export type DemoChatMessage = {
  id: string;
  text: string;
  isMine: boolean;
  createdAt: string;
};

export type DemoAppointmentDetail = AppointmentCardModel & {
  dayKey: string;
  isOnline: boolean;
  hospital: string;
  fee: number;
  tasks: DemoPreVisitTask[];
  records: { id: string; title: string; meta: string; icon: string }[];
  messages: DemoChatMessage[];
};

function shiftDay(offset: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return localDayKey(date);
}

function minutesAgo(mins: number) {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

export const DEMO_APPOINTMENT_DETAILS: Record<string, DemoAppointmentDetail> = {
  'demo-1': {
    id: 'demo-1',
    sourceId: 'demo-1',
    doctorName: 'Dr. Weber Micheal',
    specialty: 'Neurology',
    rating: 5.0,
    reviews: 1120,
    callType: 'Video via flex call',
    image:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    tasksDone: 2,
    tasksTotal: 3,
    slot: '2:00 PM',
    dayKey: shiftDay(0),
    isOnline: true,
    hospital: 'Online consultation',
    fee: 2500,
    tasks: [
      {
        id: 't1',
        title: 'Upload recent reports',
        subtitle: 'MRI / CT if available',
        done: true,
      },
      {
        id: 't2',
        title: 'Complete symptom checklist',
        subtitle: 'Helps your doctor prepare',
        done: true,
      },
      {
        id: 't3',
        title: 'Confirm medication list',
        subtitle: 'Current prescriptions',
        done: false,
      },
    ],
    records: [
      {
        id: 'r1',
        title: 'Neurology intake form',
        meta: 'Submitted · Today',
        icon: 'file-document-outline',
      },
      {
        id: 'r2',
        title: 'Previous visit summary',
        meta: '12 Jul 2026',
        icon: 'clipboard-text-outline',
      },
    ],
    messages: [
      {
        id: 'm1',
        text: 'Hello! Please upload any recent scans before our call.',
        isMine: false,
        createdAt: minutesAgo(45),
      },
      {
        id: 'm2',
        text: 'Sure doctor, I will upload them now.',
        isMine: true,
        createdAt: minutesAgo(40),
      },
      {
        id: 'm3',
        text: 'Great. We will review them together at 2:00 PM.',
        isMine: false,
        createdAt: minutesAgo(38),
      },
    ],
  },
  'demo-2': {
    id: 'demo-2',
    sourceId: 'demo-2',
    doctorName: 'Dr. Ayesha Khan',
    specialty: 'Cardiologist',
    rating: 4.9,
    reviews: 420,
    callType: 'Video via flex call',
    image:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    tasksDone: 1,
    tasksTotal: 3,
    slot: '4:30 PM',
    dayKey: shiftDay(0),
    isOnline: true,
    hospital: 'Online consultation',
    fee: 3000,
    tasks: [
      {
        id: 't1',
        title: 'Blood pressure log (7 days)',
        subtitle: 'Morning & evening readings',
        done: true,
      },
      {
        id: 't2',
        title: 'Upload ECG report',
        subtitle: 'If done in last 30 days',
        done: false,
      },
      {
        id: 't3',
        title: 'Fasting confirmation',
        subtitle: 'For lipid discussion',
        done: false,
      },
    ],
    records: [
      {
        id: 'r1',
        title: 'BP home readings',
        meta: 'Uploaded · Yesterday',
        icon: 'heart-pulse',
      },
    ],
    messages: [
      {
        id: 'm1',
        text: 'Please keep a BP log before our session today.',
        isMine: false,
        createdAt: minutesAgo(120),
      },
      {
        id: 'm2',
        text: 'I have started logging. See you at 4:30.',
        isMine: true,
        createdAt: minutesAgo(90),
      },
    ],
  },
  'demo-3': {
    id: 'demo-3',
    sourceId: 'demo-3',
    doctorName: 'Dr. Sara Ahmed',
    specialty: 'Dermatologist',
    rating: 4.8,
    reviews: 860,
    callType: 'In-clinic visit',
    image:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400',
    tasksDone: 3,
    tasksTotal: 3,
    slot: '11:00 AM',
    dayKey: shiftDay(1),
    isOnline: false,
    hospital: 'SkinCare Clinic, DHA',
    fee: 2000,
    tasks: [
      {
        id: 't1',
        title: 'Photo of affected area',
        subtitle: 'Clear daylight photo',
        done: true,
      },
      {
        id: 't2',
        title: 'Allergy history',
        subtitle: 'Known skin allergies',
        done: true,
      },
      {
        id: 't3',
        title: 'Current skincare list',
        subtitle: 'Creams / serums in use',
        done: true,
      },
    ],
    records: [
      {
        id: 'r1',
        title: 'Clinic directions',
        meta: 'Saved',
        icon: 'map-marker-outline',
      },
    ],
    messages: [
      {
        id: 'm1',
        text: 'See you tomorrow at the clinic. Bring your photos.',
        isMine: false,
        createdAt: minutesAgo(200),
      },
    ],
  },
  'demo-4': {
    id: 'demo-4',
    sourceId: 'demo-4',
    doctorName: 'Dr. Bilal Hassan',
    specialty: 'Orthopedic',
    rating: 4.7,
    reviews: 310,
    callType: 'Video via flex call',
    image:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    tasksDone: 0,
    tasksTotal: 3,
    slot: '9:30 AM',
    dayKey: shiftDay(2),
    isOnline: true,
    hospital: 'Online consultation',
    fee: 2200,
    tasks: [
      {
        id: 't1',
        title: 'Pain diary',
        subtitle: 'When pain is worst',
        done: false,
      },
      {
        id: 't2',
        title: 'X-ray upload',
        subtitle: 'Knee / joint if available',
        done: false,
      },
      {
        id: 't3',
        title: 'Mobility notes',
        subtitle: 'Walking / stairs difficulty',
        done: false,
      },
    ],
    records: [],
    messages: [
      {
        id: 'm1',
        text: 'Please complete pre-visit tasks before our video call.',
        isMine: false,
        createdAt: minutesAgo(30),
      },
    ],
  },
};

export function getDemoAppointment(id: string) {
  return DEMO_APPOINTMENT_DETAILS[id] ?? null;
}

export function isDemoAppointmentId(id?: string) {
  return Boolean(id && id.startsWith('demo-'));
}
