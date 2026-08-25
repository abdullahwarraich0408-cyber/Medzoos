import { buildHealthContext, formatHealthSummary } from './engines/healthContext';
import { generatePersonalizedGreeting } from './engines/greetingEngine';
import {
  detectIntent,
  getSpecialtyForIntent,
  isTriageEscape,
  wantsExerciseGuidance,
  wantsEducationalInfo,
} from './engines/intentDetection';
import { getQuestionsForIntent, getNextQuestion } from './engines/questionEngine';
import {
  assessRisk,
  MEDICAL_DISCLAIMER,
  riskLevelLabel,
} from './engines/riskEngine';
import {
  buildExerciseGuidanceText,
  buildRecommendationText,
  generateActions,
  suggestLabTests,
} from './engines/recommendationEngine';
import { evaluateLocalRedFlags } from './engines/localRedFlagEngine';
import type {
  CopilotContextInput,
  CopilotMessagePayload,
  CopilotSessionState,
  CopilotTurnResult,
  HealthContext,
} from './types';

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createSession(): CopilotSessionState {
  return {
    sessionId: createId(),
    phase: 'greeting',
    intent: null,
    triggerMessage: undefined,
    answers: {},
    questionIndex: 0,
    pendingQuestions: [],
    riskLevel: null,
    completed: false,
  };
}

function assistantMessage(
  text: string,
  extra: Partial<CopilotMessagePayload> = {},
): CopilotMessagePayload {
  return {
    id: createId(),
    role: 'assistant',
    text,
    timestamp: new Date().toISOString(),
    disclaimer: MEDICAL_DISCLAIMER,
    ...extra,
  };
}

export class CopilotOrchestrator {
  private context: HealthContext;
  private session: CopilotSessionState;
  private greetingSent = false;

  constructor(contextInput: CopilotContextInput, existingSession?: CopilotSessionState) {
    this.context = buildHealthContext(contextInput);
    this.session = existingSession ?? createSession();
  }

  getHealthContext() {
    return this.context;
  }

  getSession() {
    return this.session;
  }

  /** Step 1–2: Load context and personalized greeting */
  startSession(): CopilotTurnResult {
    const greeting = generatePersonalizedGreeting(this.context);
    this.greetingSent = true;
    this.session.phase = 'intent';

    return {
      greeting,
      session: this.session,
      messages: [
        assistantMessage(greeting, {
          healthSummary: formatHealthSummary(this.context),
          suggestedReplies: [
            'Back pain exercises',
            'I need a doctor',
            'Explain my lab report',
            'I missed my medicine',
          ],
        }),
      ],
    };
  }

  /** Steps 3–9: Process user message through the full pipeline */
  processMessage(userText: string): CopilotTurnResult {
    const trimmed = userText.trim();
    if (!trimmed) {
      return { messages: [], session: this.session };
    }

    const userMsg: CopilotMessagePayload = {
      id: createId(),
      role: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    // Layer 1 — deterministic emergency fast path (no LLM)
    const redFlag = evaluateLocalRedFlags(trimmed);
    if (redFlag.triggered) {
      this.session.phase = 'actions';
      this.session.intent = 'emergency';
      this.session.riskLevel = 'critical';
      this.session.completed = true;
      this.session.triggerMessage = trimmed;
      const assessment = assessRisk('emergency', trimmed, {}, this.context);
      return this.buildAssessmentResponse([userMsg], assessment, trimmed);
    }

    // Mid-questionnaire: user wants exercise / to leave triage → honor that
    if (
      this.session.phase === 'questions' &&
      this.session.pendingQuestions.length > 0 &&
      isTriageEscape(trimmed)
    ) {
      const observation = [this.session.triggerMessage, trimmed]
        .filter(Boolean)
        .join(' ');
      this.session.intent = 'lifestyle';
      this.session.triggerMessage = observation;
      this.session.pendingQuestions = [];
      this.session.questionIndex = 0;
      this.session.answers = {};
      return this.buildExerciseResponse([userMsg], observation);
    }

    // If we're mid-question flow, treat as answer
    if (
      this.session.phase === 'questions' &&
      this.session.pendingQuestions.length > 0
    ) {
      const currentQ = getNextQuestion(
        this.session.pendingQuestions,
        this.session.questionIndex,
      );
      if (currentQ) {
        this.session.answers[currentQ.id] = trimmed;
        this.session.questionIndex += 1;
      }

      const nextQ = getNextQuestion(
        this.session.pendingQuestions,
        this.session.questionIndex,
      );

      if (nextQ) {
        return {
          messages: [
            userMsg,
            assistantMessage(nextQ.text, {
              intent: this.session.intent ?? undefined,
              suggestedReplies: nextQ.options,
            }),
          ],
          session: this.session,
        };
      }

      // All questions answered → assess
      return this.completeAssessment([userMsg]);
    }

    // New intent
    const intent = detectIntent(trimmed);
    this.session.intent = intent;
    this.session.triggerMessage = trimmed;
    this.session.answers = {};
    this.session.questionIndex = 0;
    this.session.phase = 'intent';

    if (intent === 'emergency') {
      this.session.phase = 'assessment';
      const assessment = assessRisk(intent, trimmed, this.session.answers, this.context);
      this.session.riskLevel = assessment.level;
      return this.buildAssessmentResponse([userMsg], assessment, trimmed);
    }

    // Educational / informational medical inquiries
    if (wantsEducationalInfo(trimmed)) {
      this.session.phase = 'assessment';
      this.session.riskLevel = 'low';
      let educationalText = '';
      if (/diabetes|sugar|glucose|insulin/i.test(trimmed)) {
        educationalText =
          'Diabetes mellitus is a chronic metabolic condition where the body cannot effectively produce or utilize insulin, leading to elevated blood glucose (hyperglycemia).\n\n' +
          '• Type 1 Diabetes: An autoimmune condition where the pancreas produces little to no insulin.\n' +
          '• Type 2 Diabetes: The most common form, characterized by progressive insulin resistance and beta-cell dysfunction.\n\n' +
          'Key ADA 2026 Clinical Targets:\n' +
          '• Normal Fasting Glucose: 70–99 mg/dL (Diabetes diagnosis: ≥ 126 mg/dL)\n' +
          '• Normal HbA1c: < 5.7% (Diabetes diagnosis: ≥ 6.5%)\n' +
          '• Postprandial Glucose Target for Adults: < 180 mg/dL\n\n' +
          '[Source: ADA Standards of Medical Care in Diabetes]';
      } else if (/blood pressure|hypertension/i.test(trimmed)) {
        educationalText =
          'Hypertension (high blood pressure) is a common cardiovascular condition where the force of blood against artery walls is consistently too high.\n\n' +
          '• Normal Blood Pressure: < 120/80 mmHg\n' +
          '• Stage 1 Hypertension: 130–139 / 80–89 mmHg\n' +
          '• Stage 2 Hypertension: ≥ 140/90 mmHg\n\n' +
          'Lifestyle management includes sodium reduction, regular physical activity, and stress management.\n\n' +
          '[Source: ACC/AHA Guidelines]';
      } else {
        educationalText =
          'Mental health conditions like depression and anxiety are treatable health challenges involving brain chemistry, genetics, and life stressors.\n\n' +
          'If you ever feel overwhelmed or in crisis, confidential 24/7 support is available in Pakistan via Umang (0311-7786264) and Rozan (0800-22444).\n\n' +
          '[Source: APA Clinical Guidelines]';
      }

      return {
        messages: [
          userMsg,
          assistantMessage(educationalText, {
            riskLevel: 'low',
            triageLevel: 'SELF_CARE' as any,
            suggestedReplies: [
              'Check fasting sugar target',
              'Symptoms of high sugar',
              'Diabetes diet tips',
            ],
          }),
        ],
        session: this.session,
      };
    }

    // Exercise / lifestyle → answer with mobility guidance (no chest Q&A)
    if (intent === 'lifestyle' || wantsExerciseGuidance(trimmed)) {
      this.session.intent = 'lifestyle';
      return this.buildExerciseResponse([userMsg], trimmed);
    }

    const questions = getQuestionsForIntent(
      intent,
      trimmed,
      this.context,
      this.session.answers,
    );

    if (questions.length === 0) {
      this.session.phase = 'assessment';
      const assessment = assessRisk(intent, trimmed, this.session.answers, this.context);
      this.session.riskLevel = assessment.level;
      return this.buildAssessmentResponse([userMsg], assessment, trimmed);
    }

    // Start question flow
    this.session.phase = 'questions';
    this.session.pendingQuestions = questions;
    this.session.questionIndex = 0;

    const specialty = getSpecialtyForIntent(intent, trimmed);
    const intro =
      intent === 'symptoms'
        ? `I understand you're experiencing symptoms${specialty ? ` that may need a ${specialty} review` : ''}. Let me ask a few quick questions to assess urgency.`
        : `I'll help with your ${intent.replace('_', ' ')} request. A few quick questions first.`;

    const firstQ = questions[0];
    return {
      messages: [
        userMsg,
        assistantMessage(`${intro}\n\n${firstQ.text}`, {
          intent,
          suggestedReplies: firstQ.options,
        }),
      ],
      session: this.session,
    };
  }

  private buildExerciseResponse(
    userMessages: CopilotMessagePayload[],
    message: string,
  ): CopilotTurnResult {
    const assessment = assessRisk('lifestyle', message, {}, this.context);
    this.session.riskLevel = assessment.level;
    this.session.phase = 'actions';
    this.session.completed = true;
    this.session.intent = 'lifestyle';

    const actions = generateActions(
      'lifestyle',
      assessment.level,
      message,
      this.context,
      {},
    );

    const text = buildExerciseGuidanceText(message);

    return {
      messages: [
        ...userMessages,
        assistantMessage(text, {
          intent: 'lifestyle',
          riskLevel: assessment.level,
          actions,
          suggestedReplies: [
            'When should I see a doctor?',
            'Book orthopedic doctor',
            'I have chest pain',
          ],
          healthSummary: formatHealthSummary(this.context),
        }),
      ],
      session: this.session,
    };
  }

  private completeAssessment(userMessages: CopilotMessagePayload[]): CopilotTurnResult {
    this.session.phase = 'assessment';
    const observation =
      this.session.triggerMessage ||
      userMessages[userMessages.length - 1]?.text ||
      '';
    const assessment = assessRisk(
      this.session.intent ?? 'general',
      observation,
      this.session.answers,
      this.context,
    );
    this.session.riskLevel = assessment.level;
    return this.buildAssessmentResponse(userMessages, assessment, observation);
  }

  private buildAssessmentResponse(
    userMessages: CopilotMessagePayload[],
    assessment: ReturnType<typeof assessRisk>,
    messageOverride?: string,
  ): CopilotTurnResult {
    const message =
      messageOverride ??
      this.session.triggerMessage ??
      userMessages[userMessages.length - 1]?.text ??
      '';
    const intent = this.session.intent ?? 'general';
    const actions = generateActions(
      intent,
      assessment.level,
      message,
      this.context,
      this.session.answers,
    );
    const labTests = suggestLabTests(message, assessment.level);

    const summaryParts: string[] = [
      `Risk level: ${riskLevelLabel(assessment.level)}`,
    ];

    if (assessment.differentials.length > 0) {
      summaryParts.push('');
      summaryParts.push('Possible causes (not a diagnosis):');
      assessment.differentials.forEach(d => {
        summaryParts.push(
          `• ${d.condition} (${d.confidence} confidence)${d.note ? ` — ${d.note}` : ''}`,
        );
      });
    }

    if (labTests.length > 0) {
      summaryParts.push('');
      summaryParts.push(`Suggested tests: ${labTests.join(', ')}`);
      if (assessment.reasoning.length) {
        summaryParts.push('');
        summaryParts.push(
          `We recommend these because ${assessment.reasoning[0]?.toLowerCase() || 'your symptoms need clarification'}.`,
        );
      }
    }

    summaryParts.push('');
    summaryParts.push(buildRecommendationText(assessment.level, assessment.reasoning, actions));

    this.session.phase = 'actions';
    this.session.completed = true;

    const response = assistantMessage(summaryParts.join('\n'), {
      intent,
      riskLevel: assessment.level,
      differentials: assessment.differentials,
      reasoning: assessment.reasoning,
      actions,
      healthSummary: formatHealthSummary(this.context),
    });

    return {
      messages: [...userMessages, response],
      session: this.session,
    };
  }
}

export function createOrchestrator(
  contextInput: CopilotContextInput,
  session?: CopilotSessionState,
) {
  return new CopilotOrchestrator(contextInput, session);
}
