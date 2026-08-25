import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHealthDashboard } from '../../features/health/hooks/useHealthDashboard';
import { useAuth } from '../auth/AuthContext';
import { copilotApi } from '../api';
import { createOrchestrator } from './orchestrator';
import type {
  CopilotContextInput,
  CopilotMessagePayload,
  CopilotSessionState,
} from './types';

function buildContextInput(
  health: ReturnType<typeof useHealthDashboard>,
  userName?: string,
): CopilotContextInput {
  return {
    userName,
    dateOfBirth: health.profileData.dob,
    gender: undefined,
    bloodGroup: health.profileData.bloodGroup,
    familyMembers: health.profileData.familyMembers,
    medicalRecords: health.profileData.medicalRecords,
    recentReports: health.recentReports.map(r => ({
      testName: r.testName,
      collectionDate: r.collectionDate,
    })),
    upcomingBookings: health.upcomingBookings.map(b => ({
      testName: b.testName,
      collectionDate: b.collectionDate,
    })),
    orders: health.allOrders.map(o => ({
      type: o.type,
      status: o.status,
      date: o.date,
    })),
  };
}

function mapApiSession(raw?: {
  sessionId?: string;
  phase?: string;
  intent?: string | null;
  riskLevel?: string | null;
  completed?: boolean;
}): CopilotSessionState | null {
  if (!raw?.sessionId) return null;
  return {
    sessionId: raw.sessionId,
    phase: (raw.phase as CopilotSessionState['phase']) || 'intent',
    intent: (raw.intent as CopilotSessionState['intent']) ?? null,
    answers: {},
    questionIndex: 0,
    pendingQuestions: [],
    riskLevel: (raw.riskLevel as CopilotSessionState['riskLevel']) ?? null,
    completed: raw.completed ?? false,
  };
}

/**
 * Connects directly to Medzoos 20-Phase AI Health Copilot backend service.
 * Falls back to on-device orchestration if offline or unauthenticated.
 */
const PREFER_ON_DEVICE_COPILOT = false;

export function useCopilot() {
  const { user } = useAuth();
  const health = useHealthDashboard();
  const [messages, setMessages] = useState<CopilotMessagePayload[]>([]);
  const [session, setSession] = useState<CopilotSessionState | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [useRemote, setUseRemote] = useState(false);
  const orchestratorRef = useRef<ReturnType<typeof createOrchestrator> | null>(null);
  const initializedRef = useRef(false);
  const remoteSessionIdRef = useRef<string | null>(null);

  const contextInput = useMemo(
    () => buildContextInput(health, user?.name),
    [health, user?.name],
  );

  const initLocalSession = useCallback(() => {
    orchestratorRef.current = createOrchestrator(contextInput);
    const result = orchestratorRef.current.startSession();
    setSession(result.session);
    setMessages(result.messages);
    setIsReady(true);
    setUseRemote(false);
  }, [contextInput]);

  const initializeSession = useCallback(async () => {
    if (initializedRef.current || health.isLoading) return;
    initializedRef.current = true;

    if (!PREFER_ON_DEVICE_COPILOT) {
      try {
        const data = await copilotApi.createSession();
        if (data?.session?.sessionId && data.messages?.length) {
          remoteSessionIdRef.current = data.session.sessionId;
          setSession(mapApiSession(data.session));
          setMessages(data.messages as CopilotMessagePayload[]);
          setIsReady(true);
          setUseRemote(true);
          return;
        }
      } catch {
        // Fall back to on-device orchestration when API unavailable
      }
    }

    initLocalSession();
  }, [health.isLoading, initLocalSession]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: CopilotMessagePayload = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'user',
        text: trimmed,
        timestamp: new Date().toISOString(),
      };

      // 1. Optimistically display user question bubble immediately
      setMessages(prev => [...prev, userMsg]);
      setIsThinking(true);

      if (useRemote && remoteSessionIdRef.current) {
        try {
          const data = await copilotApi.sendMessage(remoteSessionIdRef.current, trimmed);
          if (data?.messages?.length) {
            setSession(mapApiSession(data.session));
            const assistantReplies = (data.messages as CopilotMessagePayload[]).filter(
              m => m.role === 'assistant',
            );
            if (assistantReplies.length > 0) {
              setMessages(prev => [...prev, ...assistantReplies]);
            } else {
              setMessages(prev => [...prev, ...(data.messages as CopilotMessagePayload[])]);
            }
            setIsThinking(false);
            return;
          }
        } catch {
          // Continue with local engine fallback below
        }
      }

      if (!orchestratorRef.current) {
        orchestratorRef.current = createOrchestrator(contextInput, session ?? undefined);
        if (messages.length === 0) {
          const start = orchestratorRef.current.startSession();
          setMessages(prev => [...prev, ...start.messages]);
          setSession(start.session);
        }
      } else {
        orchestratorRef.current = createOrchestrator(
          contextInput,
          orchestratorRef.current.getSession(),
        );
      }

      const result = orchestratorRef.current.processMessage(trimmed);
      setSession(result.session);
      const assistantReplies = result.messages.filter(m => m.role === 'assistant');
      setMessages(prev => [...prev, ...assistantReplies]);
      setUseRemote(false);
      setIsThinking(false);
    },
    [contextInput, messages.length, session, useRemote],
  );

  const resetSession = useCallback(async () => {
    initializedRef.current = false;
    orchestratorRef.current = null;
    remoteSessionIdRef.current = null;
    setMessages([]);
    setSession(null);
    setIsReady(false);
    setIsThinking(false);
    setUseRemote(false);
    // Kick off a fresh greeting session immediately
    await Promise.resolve();
    initializedRef.current = false;
  }, []);

  const startNewChat = useCallback(async () => {
    initializedRef.current = false;
    orchestratorRef.current = null;
    remoteSessionIdRef.current = null;
    setMessages([]);
    setSession(null);
    setIsReady(false);
    setIsThinking(false);
    setUseRemote(false);

    if (!PREFER_ON_DEVICE_COPILOT) {
      try {
        const data = await copilotApi.createSession();
        if (data?.session?.sessionId && data.messages?.length) {
          remoteSessionIdRef.current = data.session.sessionId;
          setSession(mapApiSession(data.session));
          setMessages(data.messages as CopilotMessagePayload[]);
          setIsReady(true);
          setUseRemote(true);
          initializedRef.current = true;
          return;
        }
      } catch {
        // fall through to local
      }
    }

    initLocalSession();
    initializedRef.current = true;
  }, [initLocalSession]);

  return {
    messages,
    session,
    isReady,
    isThinking,
    isLoading: health.isLoading,
    healthContext: orchestratorRef.current?.getHealthContext(),
    initializeSession,
    sendMessage,
    resetSession,
    startNewChat,
  };
}
