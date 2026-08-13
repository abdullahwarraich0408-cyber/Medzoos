/** AI Health Copilot — shared types for the end-to-end care journey */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type CopilotIntent =
  | 'symptoms'
  | 'medicine'
  | 'prescription'
  | 'lab'
  | 'doctor'
  | 'emergency'
  | 'insurance'
  | 'appointment'
  | 'report'
  | 'lifestyle'
  | 'vaccination'
  | 'health_advice'
  | 'mental_health'
  | 'family'
  | 'general';

export type CopilotActionType =
  | 'book_doctor'
  | 'order_medicine'
  | 'book_lab'
  | 'emergency_alert'
  | 'health_plan'
  | 'follow_up_reminder'
  | 'family_notification'
  | 'schedule_reminder'
  | 'compare_prices'
  | 'auto_refill';

export type CopilotAction = {
  id: string;
  type: CopilotActionType;
  label: string;
  reason: string;
  /** Navigation target for mobile deep links */
  navigation?: {
    tab: 'Home' | 'Health' | 'You' | 'Copilot';
    screen: string;
    params?: Record<string, unknown>;
  };
  priority: number;
};

export type DifferentialHypothesis = {
  condition: string;
  confidence: 'low' | 'medium' | 'high';
  note?: string;
};

export type CopilotQuestion = {
  id: string;
  text: string;
  options?: string[];
};

export type HealthContext = {
  personal: {
    name: string;
    firstName: string;
    age?: number;
    gender?: string;
    height?: string;
    weight?: string;
    bmi?: number;
    bloodGroup?: string;
  };
  conditions: string[];
  allergies: { medicine?: string[]; food?: string[]; environmental?: string[] };
  currentMedicines: Array<{
    name: string;
    dose?: string;
    frequency?: string;
    remainingDays?: number;
  }>;
  consultations: Array<{
    doctor?: string;
    diagnosis?: string;
    date?: string;
  }>;
  labReports: Array<{ name: string; date?: string; status?: string }>;
  familyHistory: string[];
  lifestyle: {
    smoking?: boolean;
    alcohol?: string;
    exercise?: string;
    diet?: string;
    sleep?: string;
  };
  upcomingAppointments: Array<{ doctor?: string; specialty?: string; date?: string }>;
  insights: string[];
};

export type CopilotPhase =
  | 'greeting'
  | 'intent'
  | 'questions'
  | 'assessment'
  | 'actions'
  | 'monitoring';

export type CopilotSessionState = {
  sessionId: string;
  phase: CopilotPhase;
  intent: CopilotIntent | null;
  answers: Record<string, string>;
  questionIndex: number;
  pendingQuestions: CopilotQuestion[];
  riskLevel: RiskLevel | null;
  completed: boolean;
};

export type CopilotMessagePayload = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  riskLevel?: RiskLevel;
  intent?: CopilotIntent;
  /** Educational hypotheses — not diagnoses */
  differentials?: DifferentialHypothesis[];
  reasoning?: string[];
  actions?: CopilotAction[];
  disclaimer?: string;
  healthSummary?: string;
  suggestedReplies?: string[];
};

export type CopilotTurnResult = {
  messages: CopilotMessagePayload[];
  session: CopilotSessionState;
  greeting?: string;
};

export type CopilotContextInput = {
  userName?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  familyMembers?: Array<{ name: string; relation?: string }>;
  medicalRecords?: Array<{ type: string; title: string; date: string }>;
  recentReports?: Array<{ testName?: string; collectionDate?: string }>;
  upcomingBookings?: Array<{ testName?: string; collectionDate?: string }>;
  orders?: Array<{ type?: string; status?: string; date?: string }>;
  upcomingAppointments?: Array<{
    doctorName?: string;
    specialty?: string;
    appointmentDate?: string;
  }>;
};
