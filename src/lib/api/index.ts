import { api } from './client';
import {
  submitPrescriptionOrder,
  type SubmitPrescriptionOrderInput,
} from '../prescription/submitPrescriptionOrder';
import type { RawVendor } from '../mappers/vendor';
import type { RawDoctor } from '../mappers/doctor';
import type { RawLabTest, RawLabBooking } from '../mappers/labTest';
import type { RawProduct } from '../mappers/product';
import type { RawCartItem } from '../mappers/cart';
import type { RawMedicineOrder } from '../mappers/order';
import type { AuthTokens, StoredUser } from '../auth/tokenStorage';
import type { AuthPlatform, AuthUser } from '../../types/auth';

type VendorsResponse = { vendors?: RawVendor[] };
type DoctorsResponse = { doctors?: RawDoctor[] };
type LabTestsResponse = { tests?: RawLabTest[] };
type DoctorResponse = { doctor?: RawDoctor };
type ProductsResponse = { products?: RawProduct[] };
type ProductResponse = { product?: RawProduct };
type CartResponse = { cart?: { items?: RawCartItem[]; total?: number }; items?: RawCartItem[] };
type OrdersResponse = { orders?: RawMedicineOrder[] };
type OrderResponse = { order?: RawMedicineOrder; orders?: RawMedicineOrder[] };
type AuthResponse = {
  user?: StoredUser | AuthUser;
  tokens?: AuthTokens;
  accessToken?: string;
  refreshToken?: string;
  requireOtp?: boolean;
  message?: string;
  email?: string;
};
type HospitalsResponse = { hospitals?: import('../mappers/hospital').RawHospital[] };

export type BookAppointmentPayload = {
  doctor_id: string;
  slot: string;
  appointment_date?: string;
  payment_method?: string;
  reason?: string;
  preferred_consultation_mode?: 'online' | 'in_person';
  hospital_id?: string;
  practice_location_id?: string;
  share_records?: {
    share_prescriptions?: boolean;
    share_lab_reports?: boolean;
    share_medicines?: boolean;
    share_documents?: boolean;
  };
};

export type DoctorSlotsResponse = {
  slots?: string[];
  booked?: string[];
  ranges?: string[];
  day?: string;
  works_this_day?: boolean;
  location_title?: string;
  fee?: number;
};

export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    deviceId?: string;
    platform?: AuthPlatform;
  }) => api.post<AuthResponse>('/auth/register', data),
  verifyRegisterOtp: (data: {
    email: string;
    otp: string;
    deviceId?: string;
    platform?: AuthPlatform;
  }) => api.post<AuthResponse>('/auth/register/verify-otp', data),
  resendRegisterOtp: (data: {
    email: string;
  }) => api.post<{ message: string }>('/auth/register/resend-otp', data),
  login: (data: {
    email: string;
    password: string;
    deviceId?: string;
    platform?: AuthPlatform;
  }) => api.post<AuthResponse>('/auth/login', data),
  firebaseLogin: (data: {
    idToken: string;
    deviceId?: string;
    platform?: AuthPlatform;
  }) => api.post<AuthResponse>('/auth/firebase', data),
  googleLogin: (data: {
    idToken: string;
    deviceId?: string;
    platform?: AuthPlatform;
  }) => api.post<AuthResponse>('/auth/google', data),
  appleLogin: (data: {
    idToken: string;
    deviceId?: string;
    platform?: AuthPlatform;
  }) => api.post<AuthResponse>('/auth/apple', data),
  refresh: (data: {
    refreshToken: string;
    deviceId?: string;
    platform?: AuthPlatform;
  }) => api.post<AuthResponse>('/auth/refresh', data),
  me: () => api.get<{ user?: AuthUser }>('/auth/me', { auth: 'customer' }),
  updateProfile: (data: Partial<AuthUser>) =>
    api.put<{ user?: AuthUser }>('/auth/profile', data, { auth: 'customer' }),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post(`/auth/reset-password/${token}`, { password }),
  logout: (data?: { refreshToken?: string }) =>
    api.post('/auth/logout', data, { auth: 'customer' }),
  logoutAll: () => api.post('/auth/logout-all', undefined, { auth: 'customer' }),
  deleteAccount: () =>
    api.delete('/auth/account', { auth: 'customer' }),
  devLogin: (data: {
    phone: string;
    code: string;
    deviceId?: string;
    platform?: AuthPlatform;
  }) => api.post<AuthResponse>('/auth/dev-login', data),
};

export const vendorsApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<VendorsResponse>(query ? `/vendors?${query}` : '/vendors');
  },
  getById: (id: string) => api.get<{ vendor?: RawVendor }>(`/vendors/${id}`),
};

export const productsApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<ProductsResponse>(query ? `/products?${query}` : '/products');
  },
  getById: (id: string) => api.get<ProductResponse>(`/products/${id}`),
  getReviews: (id: string) =>
    api.get<{ reviews?: Array<Record<string, unknown>> }>(`/products/${id}/reviews`),
};

export const cartApi = {
  get: () => api.get<CartResponse>('/customer/cart', { auth: 'customer' }),
  addItem: (product_id: string, quantity = 1) =>
    api.post('/customer/cart', { product_id, quantity }, { auth: 'customer' }),
  updateItem: (itemId: string, quantity: number) =>
    api.put(`/customer/cart/${itemId}`, { quantity }, { auth: 'customer' }),
  removeItem: (itemId: string) =>
    api.delete(`/customer/cart/${itemId}`, { auth: 'customer' }),
  merge: (items: Array<{ product_id: string; quantity: number }>) =>
    api.post('/customer/cart/merge', { items }, { auth: 'customer' }),
  clear: () => api.delete('/cart', { auth: 'customer' }),
};

export type CreateOrderPayload = {
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price?: number;
  }>;
  delivery_address: {
    street: string;
    city: string;
    zip?: string;
  };
  payment_method?: string;
};

export const ordersApi = {
  getAll: () => api.get<OrdersResponse>('/orders', { auth: 'customer' }),
  getById: (id: string) => api.get<OrderResponse>(`/orders/${id}`, { auth: 'customer' }),
  create: (data: CreateOrderPayload) =>
    api.post<OrderResponse>('/orders', data, { auth: 'customer' }),
};

export const categoriesApi = {
  getAll: () =>
    api.get<{ categories?: Array<{ id: string; name: string }> }>('/categories'),
};

export const doctorsApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<DoctorsResponse>(query ? `/doctors?${query}` : '/doctors');
  },
  getById: (id: string) => api.get<DoctorResponse>(`/doctors/${id}`),
  getReviews: (id: string) =>
    api.get<{ reviews?: Array<Record<string, unknown>> }>(`/doctors/${id}/reviews`),
  getFilters: () =>
    api.get<{ filters?: Record<string, string[]> }>('/doctors/filters'),
  getSlots: (id: string, date: string, params: Record<string, string> = {}) => {
    const search = new URLSearchParams({ ...(date ? { date } : {}), ...params });
    const query = search.toString();
    return api.get<DoctorSlotsResponse>(
      query ? `/doctors/${id}/slots?${query}` : `/doctors/${id}/slots`,
    );
  },
  bookAppointment: (data: BookAppointmentPayload) =>
    api.post<{ appointment?: Record<string, unknown> }>(
      '/doctors/appointments',
      data,
      { auth: 'customer' },
    ),
  getMyAppointments: () =>
    api.get<{ appointments?: Record<string, unknown>[] }>(
      '/doctors/appointments/me',
      { auth: 'customer' },
    ),
};

export type BookLabTestPayload = {
  lab_test_id: string;
  patient_name: string;
  patient_gender?: string;
  patient_age?: number;
  collection_type: 'HOME' | 'VISIT_LAB';
  time_slot: string;
  payment_method?: string;
  collection_date: string;
  collection_address?: { line: string; city: string; phone: string };
  prescription_url?: string;
};

export type CreateLabOrderPayload = {
  lab_test_ids: string[];
  patient_name: string;
  patient_gender?: string;
  patient_age?: number;
  collection_type: 'HOME' | 'VISIT_LAB';
  collection_address?: { line: string; city: string; phone: string };
  collection_date: string;
  time_slot: string;
  payment_method?: string;
  prescription_url?: string;
};

export const labTestsApi = {
  getCategories: () =>
    api.get<{ categories?: Array<{ id: string; label: string; icon?: string }> }>(
      '/lab-tests/categories',
    ),
  getTimeSlots: () =>
    api.get<{ timeSlots?: string[]; time_slots?: string[] }>(
      '/lab-tests/time-slots',
    ),
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<LabTestsResponse>(query ? `/lab-tests?${query}` : '/lab-tests');
  },
  getPopular: () => api.get<LabTestsResponse>('/lab-tests/popular'),
  getById: (id: string) =>
    api.get<{ test?: RawLabTest; lab_test?: RawLabTest }>(`/lab-tests/${id}`),
  book: (data: BookLabTestPayload) =>
    api.post<{ booking?: RawLabBooking }>('/lab-tests/bookings', data, {
      auth: 'customer',
    }),
  createOrder: (data: CreateLabOrderPayload) =>
    api.post<{ orders?: RawLabBooking[]; total?: number }>(
      '/lab-tests/orders',
      data,
      { auth: 'customer' },
    ),
  getMyBookings: () =>
    api.get<{ bookings?: RawLabBooking[] }>('/lab-tests/bookings/me', {
      auth: 'customer',
    }),
  getMyReports: () =>
    api.get<{ reports?: RawLabBooking[]; bookings?: RawLabBooking[] }>(
      '/lab-tests/reports/me',
      { auth: 'customer' },
    ),
  cancelBooking: (id: string) =>
    api.delete(`/lab-tests/bookings/${id}`, { auth: 'customer' }),
  getLabs: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<{ labs?: import('../mappers/labTest').RawLabPartner[] }>(
      query ? `/lab-tests/labs?${query}` : '/lab-tests/labs',
    );
  },
  getLabById: (id: string) =>
    api.get<{ lab?: import('../mappers/labTest').RawLabPartner }>(`/lab-tests/labs/${id}`),
};

export const hospitalsApi = {
  getAll: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<HospitalsResponse>(query ? `/hospitals?${query}` : '/hospitals');
  },
  getById: (id: string) =>
    api.get<{ hospital?: import('../mappers/hospital').RawHospital }>(`/hospitals/${id}`),
  getDoctors: (id: string, params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<{
      hospital?: import('../mappers/hospital').RawHospital;
      doctors?: RawDoctor[];
      specialties?: string[];
    }>(query ? `/hospitals/${id}/doctors?${query}` : `/hospitals/${id}/doctors`);
  },
};

export const prescriptionOrdersApi = {
  getAll: () =>
    api.get<{ orders?: import('../mappers/prescriptionOrder').RawPrescriptionOrder[] }>(
      '/prescription-orders',
      { auth: 'customer' },
    ),
  getById: (id: string) =>
    api.get<{ order?: import('../mappers/prescriptionOrder').RawPrescriptionOrder }>(
      `/prescription-orders/${id}`,
      { auth: 'customer' },
    ),
  create: (input: SubmitPrescriptionOrderInput) => submitPrescriptionOrder(input),
};

export type UserProfile = StoredUser & {
  created_at?: string;
  profile_data?: import('../profile/profileData').ProfileData;
};

export const usersApi = {
  getProfile: () =>
    api.get<{ user?: UserProfile }>('/users/profile', { auth: 'customer' }),
  updateProfile: (data: {
    name?: string;
    phone?: string;
    profile_data?: import('../profile/profileData').ProfileData;
  }) => api.patch<{ user?: UserProfile }>('/users/profile', data, { auth: 'customer' }),
  changePassword: (data: {
    current_password: string;
    new_password: string;
  }) => api.post<{ message?: string }>('/users/password', data, { auth: 'customer' }),
  updateNotificationPreferences: (data: Record<string, boolean>) =>
    api.post<{ message?: string }>('/notifications/preferences', data, {
      auth: 'customer',
    }),
};

export const notificationsApi = {
  registerDeviceToken: (data: {
    fcmToken: string;
    deviceId: string;
    platform: AuthPlatform;
  }) =>
    api.post<{ message?: string }>('/notifications/device-token', data, {
      auth: 'customer',
    }),
  sendTest: () =>
    api.post<{ message?: string }>('/notifications/test-push', undefined, {
      auth: 'customer',
    }),
};

export type VaultFamilyMember = {
  id: string;
  full_name: string;
  relationship: string;
  gender?: string | null;
  date_of_birth?: string | null;
  blood_group?: string | null;
  health_score?: number | null;
};

export type FamilyHealthVault = {
  id: string;
  name?: string | null;
  home_address?: string | null;
  emergency_contact?: string | null;
  preferred_hospital?: string | null;
  preferred_pharmacy?: string | null;
  preferred_lab?: string | null;
  members?: VaultFamilyMember[];
  dashboard?: Array<{
    id: string;
    full_name: string;
    relationship: string;
    health_score?: number;
    status_lines?: string[];
  }>;
};

export type VaultDashboardMember = {
  id: string;
  full_name: string;
  relationship: string;
  health_score?: number;
  status_lines?: string[];
  alerts?: Array<{ type: string; severity: string; message: string }>;
};

export type VaultCalendarEvent = {
  id: string;
  member_id: string;
  member_name: string;
  type: string;
  title: string;
  date: string;
};

export type VaultWeeklySummary = {
  generated_at: string;
  overall_family_health_score?: number | null;
  disclaimer?: string;
  members: Array<{
    id: string;
    name: string;
    relationship: string;
    health_score?: number;
    bullets: string[];
  }>;
};

export type VaultOcrMedicine = {
  name?: string;
  dose?: string;
  frequency?: string[];
  instructions?: string;
  duration?: string;
  purpose?: string | null;
  purpose_source?: 'prescription' | 'inferred' | 'unknown';
};

export type PrescriptionOcrData = {
  note?: string;
  doctor?: string | null;
  clinic?: string | null;
  diagnosis?: string | null;
  lab_tests?: string[];
  medicines?: VaultOcrMedicine[];
  confidence?: string;
  provider?: string;
};

export const prescriptionsApi = {
  read: (data: { file_url: string }) =>
    api.post<{ ocr_data?: PrescriptionOcrData }>('/prescriptions/read', data, {
      auth: 'customer',
    }),
};

export type VaultMemberDetail = VaultFamilyMember & {
  medicines?: Array<{
    id: string;
    name: string;
    dose?: string | null;
    morning?: boolean;
    afternoon?: boolean;
    night?: boolean;
    instructions?: string | null;
    purpose?: string | null;
    prescribing_doctor?: string | null;
  }>;
  vitals?: Array<{
    id: string;
    vital_type: string;
    value: string;
    unit?: string;
    recorded_at: string;
  }>;
  prescriptions?: Array<{
    id: string;
    file_url: string;
    file_type?: string;
    ocr_data?: {
      note?: string;
      doctor?: string | null;
      diagnosis?: string | null;
      lab_tests?: string[];
      medicines?: VaultOcrMedicine[];
      confidence?: string;
      provider?: string;
    };
    uploaded_at: string;
  }>;
  timeline?: Array<{ id: string; title: string; event_type: string; event_date: string }>;
};

export const familyVaultApi = {
  createFamily: (data: {
    name?: string;
    home_address?: string;
    emergency_contact?: string;
    preferred_hospital?: string;
    preferred_pharmacy?: string;
    preferred_lab?: string;
  }) => api.post<{ vault?: FamilyHealthVault }>('/family-vault', data, { auth: 'customer' }),
  getFamily: () =>
    api.get<{ vault?: FamilyHealthVault | null }>('/family-vault', { auth: 'customer' }),
  addMember: (data: {
    full_name: string;
    relationship: string;
    gender?: string;
    date_of_birth?: string;
    blood_group?: string;
    height_cm?: number;
    weight_kg?: number;
    phone?: string;
    email?: string;
  }) => api.post<{ member?: VaultFamilyMember }>('/family-vault/members', data, { auth: 'customer' }),
  getDashboard: () =>
    api.get<{
      members?: VaultDashboardMember[];
      overall_score?: number;
      family_name?: string;
    }>('/family-vault/dashboard', { auth: 'customer' }),
  getCalendar: (params: { from?: string; to?: string } = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v) as [string, string][],
    ).toString();
    return api.get<{ events?: VaultCalendarEvent[] }>(
      query ? `/family-vault/calendar?${query}` : '/family-vault/calendar',
      { auth: 'customer' },
    );
  },
  getAiInsights: () =>
    api.get<{
      generated_at?: string;
      disclaimer?: string;
      members?: Array<{
        member_id: string;
        member_name: string;
        health_score?: number;
        alerts?: Array<{ type: string; severity: string; message: string }>;
      }>;
    }>('/family-vault/ai-insights', { auth: 'customer' }),
  getWeeklySummary: () =>
    api.get<VaultWeeklySummary>('/family-vault/weekly-summary', { auth: 'customer' }),
  copilotQuery: (question: string) =>
    api.post<{
      answer?: string;
      memberId?: string;
      disclaimer?: string;
    }>('/family-vault/copilot', { question }, { auth: 'customer' }),
  getMember: (memberId: string) =>
    api.get<{ member?: VaultMemberDetail }>(
      `/family-vault/members/${memberId}`,
      { auth: 'customer' },
    ),
  addVital: (
    memberId: string,
    data: {
      vital_type: string;
      value: string;
      unit?: string;
      recorded_at?: string;
      notes?: string;
    },
  ) =>
    api.post(`/family-vault/members/${memberId}/vitals`, data, { auth: 'customer' }),
  addPrescription: (
    memberId: string,
    data: { file_url: string; file_type?: string },
  ) =>
    api.post(`/family-vault/members/${memberId}/prescriptions`, data, {
      auth: 'customer',
    }),
  deletePrescription: (memberId: string, prescriptionId: string) =>
    api.delete(`/family-vault/members/${memberId}/prescriptions/${prescriptionId}`, {
      auth: 'customer',
    }),
};

export type Address = {
  id: string;
  name?: string;
  street?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  is_default?: boolean;
};

export const addressesApi = {
  getAll: () =>
    api.get<{ addresses?: Address[] }>('/addresses', { auth: 'customer' }),
  create: (data: Omit<Address, 'id'>) =>
    api.post<{ address?: Address }>('/addresses', data, { auth: 'customer' }),
  update: (id: string, data: Partial<Omit<Address, 'id'>>) =>
    api.put<{ address?: Address }>(`/addresses/${id}`, data, { auth: 'customer' }),
  delete: (id: string) =>
    api.delete(`/addresses/${id}`, { auth: 'customer' }),
};

export const healthApi = {
  check: () => api.get<{ status?: string }>('/health'),
};

export type TelehealthChatAccess = {
  allowed: boolean;
  readOnly?: boolean;
  reason?: string;
  opensAt?: string;
  closesAt?: string;
};

export type TelehealthChatMessage = {
  id: string;
  chat_id?: string;
  sender_id: string;
  sender_role: string;
  message?: string | null;
  message_type?: string;
  attachment_url?: string | null;
  is_read?: boolean;
  created_at: string;
};

export type TelehealthChatResponse = {
  chat?: Record<string, unknown> | null;
  messages?: TelehealthChatMessage[];
  access?: TelehealthChatAccess;
  videoAccess?: TelehealthChatAccess & {
    waitingRoom?: boolean;
    joinUrl?: string;
    roomId?: string;
  };
  appointment?: {
    id: string;
    status?: string;
    slot?: string;
    appointment_date?: string;
    meeting_id?: string;
    meeting_url?: string;
    doctor?: { id?: string; name?: string; specialty?: string; photo_url?: string };
    customer?: { id?: string; name?: string };
  };
};

export const telehealthApi = {
  getChat: (appointmentId: string) =>
    api.get<TelehealthChatResponse>(
      `/telehealth/appointments/${appointmentId}/chat`,
      { auth: 'customer' },
    ),
  sendMessage: (
    appointmentId: string,
    data: {
      message?: string;
      message_type?: string;
      attachment_url?: string;
    },
  ) =>
    api.post<{ message?: TelehealthChatMessage }>(
      `/telehealth/appointments/${appointmentId}/chat/messages`,
      data,
      { auth: 'customer' },
    ),
  markRead: (appointmentId: string) =>
    api.patch(
      `/telehealth/appointments/${appointmentId}/chat/read`,
      {},
      { auth: 'customer' },
    ),
  getVideoAccess: (appointmentId: string) =>
    api.get<TelehealthChatResponse>(
      `/telehealth/appointments/${appointmentId}/video`,
      { auth: 'customer' },
    ),
};

export type CopilotSessionResponse = {
  session?: {
    sessionId: string;
    phase: string;
    intent?: string | null;
    riskLevel?: string | null;
    completed?: boolean;
  };
  messages?: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    text: string;
    timestamp: string;
    riskLevel?: string;
    intent?: string;
    differentials?: Array<{ condition: string; confidence: string; note?: string }>;
    reasoning?: string[];
    actions?: Array<{
      id: string;
      type: string;
      label: string;
      reason: string;
      priority: number;
      navigation?: { screen: string; params?: Record<string, unknown> };
    }>;
    disclaimer?: string;
    suggestedReplies?: string[];
  }>;
};

export type TriageApiResponse = {
  triageLevel?: string;
  emergency?: boolean;
  reasonCode?: string;
  reasoning?: string;
  text?: string;
  actions?: Array<Record<string, unknown>>;
  suggestedReplies?: string[];
  metadata?: Record<string, unknown>;
  riskLevel?: string;
  providers?: unknown;
};

export const copilotApi = {
  createSession: () =>
    api.post<CopilotSessionResponse>('/v2/copilot/sessions', {}, { auth: 'auto' }),
  getSession: (sessionId: string) =>
    api.get<CopilotSessionResponse>(`/v2/copilot/sessions/${sessionId}`, {
      auth: 'auto',
    }),
  sendMessage: (sessionId: string, message: string) =>
    api.post<CopilotSessionResponse & { triage?: TriageApiResponse }>(
      `/v2/copilot/sessions/${sessionId}/messages`,
      { message },
      { auth: 'auto' },
    ),
  /** Stateless deterministic triage (backend source of truth). */
  triage: (message: string, answers?: Record<string, string>) =>
    api.post<TriageApiResponse>(
      '/v2/copilot/triage',
      { message, answers },
      { auth: 'auto' },
    ),
};

export const communityApi = {
  getPosts: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get<{ posts?: import('../community/types').CommunityPost[]; requiresJoin?: boolean }>(
      query ? `/community/posts?${query}` : '/community/posts',
      { auth: 'auto' },
    );
  },
  getPost: (id: string) =>
    api.get<{ post?: import('../community/types').CommunityPost }>(
      `/community/posts/${id}`,
      { auth: 'auto' },
    ),
  createPost: (data: {
    content: string;
    category: string;
    is_anonymous: boolean;
    group_id?: string;
    post_type?: 'text' | 'video' | 'photo';
    image_url?: string;
    video_url?: string;
    thumbnail_url?: string;
  }) => api.post('/community/posts', data, { auth: 'customer' }),
  addComment: (postId: string, content: string) =>
    api.post(`/community/posts/${postId}/comments`, { content }, { auth: 'customer' }),
  toggleLike: (postId: string) =>
    api.post(`/community/posts/${postId}/like`, {}, { auth: 'customer' }),

  getGroups: () =>
    api.get<{ groups?: import('../community/types').HealthGroup[] }>(
      '/community/groups',
      { auth: 'auto' },
    ),
  getGroup: (id: string) =>
    api.get<{ group?: import('../community/types').HealthGroup }>(
      `/community/groups/${id}`,
      { auth: 'auto' },
    ),
  createGroup: (data: {
    name: string;
    description?: string;
    icon?: string;
    weekly_topic?: string;
  }) => api.post('/community/groups', data, { auth: 'customer' }),
  joinGroup: (id: string) =>
    api.post(`/community/groups/${id}/join`, {}, { auth: 'customer' }),
  leaveGroup: (id: string) =>
    api.delete(`/community/groups/${id}/leave`, { auth: 'customer' }),
  getGroupMembers: (id: string) =>
    api.get<{
      members?: Array<{ id: string; name: string; role: string }>;
      canManage?: boolean;
    }>(`/community/groups/${id}/members`, { auth: 'customer' }),
  addGroupMember: (groupId: string, userId: string) =>
    api.post(
      `/community/groups/${groupId}/members`,
      { user_id: userId },
      { auth: 'customer' },
    ),

  getChallenges: () =>
    api.get<{ challenges?: import('../community/types').HealthChallenge[] }>(
      '/community/challenges',
      { auth: 'auto' },
    ),
  getChallenge: (id: string) =>
    api.get<{ challenge?: import('../community/types').HealthChallenge }>(
      `/community/challenges/${id}`,
      { auth: 'auto' },
    ),
  createChallenge: (data: Record<string, unknown>) =>
    api.post('/community/challenges', data, { auth: 'customer' }),
  joinChallenge: (id: string) =>
    api.post(`/community/challenges/${id}/join`, {}, { auth: 'customer' }),
  leaveChallenge: (id: string) =>
    api.delete(`/community/challenges/${id}/leave`, { auth: 'customer' }),
  updateChallengeProgress: (id: string, progress: number) =>
    api.patch(`/community/challenges/${id}/progress`, { progress }, { auth: 'customer' }),

  getBuddies: () =>
    api.get<{ buddies?: import('../community/types').HealthBuddy[] }>(
      '/community/buddies',
      { auth: 'customer' },
    ),
  getBuddySuggestions: () =>
    api.get<{ suggestions?: import('../community/types').BuddySuggestion[] }>(
      '/community/buddies/suggestions',
      { auth: 'customer' },
    ),
  addBuddy: (userId: string, relation: string) =>
    api.post('/community/buddies', { user_id: userId, relation }, { auth: 'customer' }),
  removeBuddy: (id: string) =>
    api.delete(`/community/buddies/${id}`, { auth: 'customer' }),
  encourageBuddy: (id: string) =>
    api.post(`/community/buddies/${id}/encourage`, {}, { auth: 'customer' }),

  getProfile: () =>
    api.get<{ profile?: import('../community/types').CommunityProfile }>(
      '/community/profile/me',
      { auth: 'customer' },
    ),
  getWeeklyReport: () =>
    api.get<{ report?: import('../community/types').WeeklyReport }>(
      '/community/reports/weekly',
      { auth: 'customer' },
    ),
  searchUsers: (q: string) =>
    api.get<{ users?: Array<{ id: string; name: string }> }>(
      `/community/users/search?q=${encodeURIComponent(q)}`,
      { auth: 'customer' },
    ),
};

export const healthRecordsApi = {
  listDocuments: (documentType?: string) =>
    api.get<{ documents?: Array<Record<string, unknown>> }>(
      documentType
        ? `/health-records/documents?document_type=${encodeURIComponent(documentType)}`
        : '/health-records/documents',
      { auth: 'customer' },
    ),
  createDocument: (data: {
    document_type: string;
    title?: string;
    doctor_name?: string;
    hospital_name?: string;
    document_date?: string;
    file_url: string;
    notes?: string;
  }) =>
    api.post<{ document?: Record<string, unknown> }>(
      '/health-records/documents',
      data,
      { auth: 'customer' },
    ),
  deleteDocument: (id: string) =>
    api.delete(`/health-records/documents/${id}`, { auth: 'customer' }),
  getTimeline: () =>
    api.get<{ timeline?: Array<Record<string, unknown>> }>(
      '/health-records/timeline',
      { auth: 'customer' },
    ),
};

export type HomeSlideAudience = 'first_visit' | 'returning';

export type HomeSlideDto = {
  id: string;
  audience: HomeSlideAudience;
  slot: number;
  title: string;
  cta: string;
  action: string;
  image_url?: string;
  bg?: string;
  label?: string | null;
  description?: string | null;
  badge?: string | null;
};

export const homeSlidesApi = {
  list: (audience: HomeSlideAudience) =>
    api.get<{ slides?: HomeSlideDto[]; audience?: HomeSlideAudience }>(
      `/home-slides?audience=${audience}`,
    ),
};

export type ContentItemDto = {
  id: string;
  section: string;
  channel: string;
  sort_order: number;
  title: string;
  subtitle?: string;
  body?: string;
  cta?: string;
  action?: string;
  href?: string;
  icon?: string;
  image_url?: string;
  bg?: string;
  badge?: string;
  meta?: string;
};

export const contentApi = {
  list: (section?: string, channel: 'app' | 'website' | 'both' = 'app') => {
    const params = new URLSearchParams();
    if (section) params.set('section', section);
    params.set('channel', channel);
    return api.get<{
      items?: ContentItemDto[];
      settings?: Record<string, string>;
    }>(`/content?${params.toString()}`);
  },
};

export type StripeCheckoutPurpose = 'order' | 'appointment' | 'lab';

export type StripeCheckoutPayload = {
  purpose: StripeCheckoutPurpose;
  order_ids?: string[];
  total_amount?: number;
  appointment_id?: string;
  booking_ids?: string[];
  order_group_id?: string;
  payment_method?: 'stripe' | 'cod' | 'card' | 'bankalfalah';
  frontend_url?: string;
};

export type StripeCheckoutResponse = {
  checkoutUrl?: string;
  sessionId?: string;
  purpose?: StripeCheckoutPurpose;
};

export type StripeVerifyResponse = {
  paid?: boolean;
  purpose?: StripeCheckoutPurpose;
  sessionId?: string;
  status?: string;
  orderIds?: string[];
  appointmentId?: string;
  bookingIds?: string[];
};

export const paymentsApi = {
  checkout: (data: StripeCheckoutPayload) =>
    api.post<StripeCheckoutResponse>('/payments/checkout', data, {
      auth: 'customer',
    }),
  verifyStripeSession: (sessionId: string) =>
    api.get<StripeVerifyResponse>(
      `/payments/stripe/verify?session_id=${encodeURIComponent(sessionId)}`,
      { auth: 'customer' },
    ),
};
