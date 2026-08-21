import { buildHealthContext, formatHealthSummary } from './engines/healthContext';
import { generatePersonalizedGreeting } from './engines/greetingEngine';
import {
  detectIntent,
  getSpecialtyForIntent,
} from './engines/intentDetection';
import { getQuestionsForIntent, getNextQuestion } from './engines/questionEngine';
import {
  assessRisk,
  MEDICAL_DISCLAIMER,
  riskLevelLabel,
} from './engines/riskEngine';
import {
  buildRecommendationText,
  generateActions,
  suggestLabTests,
} from './engines/recommendationEngine';
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
            'I have chest pain',
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

    const responses: CopilotMessagePayload[] = [];

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
        responses.push(
          assistantMessage(nextQ.text, {
            intent: this.session.intent ?? undefined,
            suggestedReplies: nextQ.options,
          }),
        );
        return { messages: [userMsg, ...responses], session: this.session };
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
    responses.push(
      assistantMessage(`${intro}\n\n${firstQ.text}`, {
        intent,
        suggestedReplies: firstQ.options,
      }),
    );

    return { messages: [userMsg, ...responses], session: this.session };
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
