import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  telehealthApi,
  type TelehealthChatMessage,
  type TelehealthChatResponse,
} from '../api';

function appendChatMessage(
  old: TelehealthChatResponse | undefined,
  message: TelehealthChatMessage | undefined,
): TelehealthChatResponse | undefined {
  if (!old || !message) return old;
  if (old.messages?.some(item => item.id === message.id)) return old;
  return { ...old, messages: [...(old.messages || []), message] };
}

export function formatDoctorDisplayName(name?: string | null) {
  if (!name) return 'Doctor';
  const trimmed = String(name).trim();
  if (/^dr\.?\s/i.test(trimmed)) return trimmed;
  return `Dr. ${trimmed}`;
}

export function getChatParticipantLabels(
  appointment: TelehealthChatResponse['appointment'],
) {
  const doctorName = formatDoctorDisplayName(appointment?.doctor?.name);
  const patientName = appointment?.customer?.name?.trim() || 'You';

  return {
    doctorName,
    patientName,
    pageTitle: `Chat with ${doctorName}`,
    panelTitle: doctorName,
  };
}

export function mapChatMessage(
  message: TelehealthChatMessage,
  currentUserId?: string,
  participantLabels?: ReturnType<typeof getChatParticipantLabels>,
) {
  const senderName =
    message.sender_role === 'doctor'
      ? participantLabels?.doctorName || 'Doctor'
      : message.sender_role === 'customer'
        ? participantLabels?.patientName || 'You'
        : null;

  return {
    id: message.id,
    text: message.message,
    type: message.message_type,
    attachmentUrl: message.attachment_url,
    senderRole: message.sender_role,
    senderName,
    isMine: message.sender_id === currentUserId,
    isSystem: message.sender_role === 'system',
    createdAt: message.created_at,
  };
}

export function useAppointmentChat(appointmentId: string | undefined) {
  return useQuery({
    queryKey: ['appointment-chat', appointmentId],
    queryFn: () => telehealthApi.getChat(appointmentId!),
    enabled: Boolean(appointmentId),
    refetchInterval: 5000,
  });
}

export function useSendAppointmentMessage(appointmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      message?: string;
      message_type?: string;
      attachment_url?: string;
    }) => telehealthApi.sendMessage(appointmentId, payload),
    onSuccess: data => {
      const message = data?.message;
      if (!message) return;
      queryClient.setQueryData(['appointment-chat', appointmentId], (old: TelehealthChatResponse | undefined) =>
        appendChatMessage(old, message),
      );
    },
  });
}

export function useMarkAppointmentChatRead(appointmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => telehealthApi.markRead(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-chat', appointmentId] });
    },
  });
}

export function useMarkChatReadOnOpen(
  appointmentId: string,
  access?: TelehealthChatResponse['access'],
) {
  const markRead = useMarkAppointmentChatRead(appointmentId);

  useEffect(() => {
    if (access?.allowed && !access?.readOnly) {
      markRead.mutate();
    }
  }, [appointmentId, access?.allowed, access?.readOnly]);
}
