import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { telehealthApi } from '../../../lib/api';
import { useAuth } from '../../../lib/auth/AuthContext';
import { TelehealthVideoWebView } from '../../../lib/telehealth/TelehealthVideoWebView';
import {
  buildJitsiMeetUrl,
  isDirectMeetUrl,
  resolveVideoRoomFromAccess,
} from '../../../lib/telehealth/videoRoom';
import type { YouStackParamList } from '../../../navigation/types';

type VideoRoute = RouteProp<YouStackParamList, 'AppointmentVideo'>;
type VideoNav = NativeStackNavigationProp<YouStackParamList, 'AppointmentVideo'>;

export function AppointmentVideoScreen() {
  const navigation = useNavigation<VideoNav>();
  const route = useRoute<VideoRoute>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { doctorName, doctorImage, appointmentId, meetingUrl } = (route.params ||
    {}) as {
    doctorName?: string;
    doctorImage?: string;
    appointmentId?: string;
    meetingUrl?: string;
  };

  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [webReady, setWebReady] = useState(false);

  const videoAccessQuery = useQuery({
    queryKey: ['appointment-video', appointmentId],
    queryFn: () => telehealthApi.getVideoAccess(appointmentId!),
    enabled: Boolean(appointmentId),
    refetchInterval: 12_000,
  });

  const resolved = useMemo(
    () => resolveVideoRoomFromAccess(videoAccessQuery.data),
    [videoAccessQuery.data],
  );

  // Prefer Medzoos logged-in patient name — no second video login
  const patientDisplayName =
    user?.name || resolved.displayName || 'Patient';

  const url = useMemo(() => {
    if (!resolved.allowed) return '';
    if (resolved.embedUrl && isDirectMeetUrl(resolved.embedUrl)) {
      return resolved.embedUrl;
    }
    if (resolved.jitsiRoom) {
      return buildJitsiMeetUrl(
        resolved.jitsiRoom,
        patientDisplayName,
        resolved.host || undefined,
      );
    }
    if (isDirectMeetUrl(meetingUrl)) {
      return meetingUrl!;
    }
    return '';
  }, [resolved, meetingUrl, patientDisplayName]);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return hrs > 0
      ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
      : `${pad(mins)}:${pad(secs)}`;
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={StyleSheet.absoluteFill}>
        {url ? (
          <TelehealthVideoWebView
            url={url}
            style={styles.webVideo}
            muted={isMuted}
            cameraOff={isVideoOff}
            onReadyChange={setWebReady}
            loadingLabel="Connecting secure session…"
          />
        ) : (
          <View style={styles.fallbackStage}>
            {videoAccessQuery.isLoading ? (
              <ActivityIndicator color="#14B8A6" size="large" />
            ) : doctorImage ? (
              <Image source={{ uri: doctorImage }} style={styles.fallbackImage} />
            ) : (
              <View style={styles.fallbackAvatar}>
                <Icon name="account" size={72} color="#94A3B8" />
              </View>
            )}
            <Text style={styles.fallbackName}>{doctorName || 'Doctor'}</Text>
            <Text style={styles.fallbackSub}>
              {resolved.reason ||
                (videoAccessQuery.isLoading
                  ? 'Connecting to secure video room…'
                  : 'Waiting for doctor to start the consultation')}
            </Text>
            <Pressable
              style={styles.retryBtn}
              onPress={() => videoAccessQuery.refetch()}>
              <Text style={styles.retryBtnText}>Retry join</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View
        style={[
          styles.topOverlay,
          { paddingTop: insets.top + (Platform.OS === 'ios' ? 8 : 16) },
        ]}>
        <Pressable
          style={styles.backCircleBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back">
          <Icon name="arrow-left" size={20} color="#0F172A" />
        </Pressable>

        <View style={styles.timerPill}>
          <View style={styles.redDot} />
          <Text style={styles.timerText}>
            {webReady || !url ? formatTime(seconds) : 'Connecting…'}
          </Text>
        </View>
      </View>

      {/* Decorative PiP — don't steal touches from Jitsi */}
      {!webReady ? (
        <View
          style={[styles.pipContainer, { bottom: insets.bottom + 110 }]}
          pointerEvents="none">
          {isVideoOff ? (
            <View style={styles.pipAvatarFallback}>
              <Icon name="camera-off" size={24} color="#94A3B8" />
              <Text style={styles.pipOffText}>Cam Off</Text>
            </View>
          ) : (
            <View style={styles.pipVideoBox}>
              <View style={styles.pipTag}>
                <Text style={styles.pipTagText}>You</Text>
              </View>
            </View>
          )}
        </View>
      ) : null}

      <View
        style={[
          styles.bottomDockContainer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}>
        <View style={styles.actionDock}>
          <Pressable
            style={[styles.dockBtn, isMuted && styles.dockBtnActive]}
            onPress={() => setIsMuted(!isMuted)}>
            <Icon
              name={isMuted ? 'microphone-off' : 'microphone'}
              size={22}
              color={isMuted ? '#EF4444' : '#0F172A'}
            />
          </Pressable>
          <Pressable
            style={[styles.dockBtn, isVideoOff && styles.dockBtnActive]}
            onPress={() => setIsVideoOff(!isVideoOff)}>
            <Icon
              name={isVideoOff ? 'video-off' : 'video'}
              size={22}
              color={isVideoOff ? '#EF4444' : '#0F172A'}
            />
          </Pressable>
          <Pressable
            style={[styles.dockBtn, !isSpeakerOn && styles.dockBtnActive]}
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}>
            <Icon
              name={isSpeakerOn ? 'volume-high' : 'volume-off'}
              size={22}
              color={!isSpeakerOn ? '#EF4444' : '#0F172A'}
            />
          </Pressable>
          <Pressable style={styles.endCallBtn} onPress={() => navigation.goBack()}>
            <Icon name="phone-hangup" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  webVideo: { flex: 1, width: '100%', backgroundColor: '#000000' },
  fallbackStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 28,
    gap: 10,
  },
  fallbackImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  fallbackAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  fallbackName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  fallbackSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#14B8A6',
  },
  retryBtnText: {
    color: '#042F2E',
    fontWeight: '700',
    fontSize: 13,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15,23,42,0.72)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  timerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  pipContainer: {
    position: 'absolute',
    right: 16,
    width: 96,
    height: 128,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  pipVideoBox: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  pipAvatarFallback: {
    flex: 1,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pipOffText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  pipTag: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pipTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  bottomDockContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  actionDock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 28,
  },
  dockBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockBtnActive: {
    backgroundColor: '#FEE2E2',
  },
  endCallBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
