import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Image,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { YouStackParamList } from '../../../navigation/types';

type VideoRoute = RouteProp<YouStackParamList, 'AppointmentVideo'>;
type VideoNav = NativeStackNavigationProp<YouStackParamList, 'AppointmentVideo'>;

export function AppointmentVideoScreen() {
  const navigation = useNavigation<VideoNav>();
  const route = useRoute<VideoRoute>();
  const insets = useSafeAreaInsets();
  const { doctorName, doctorImage, appointmentId, meetingUrl } = (route.params || {}) as any;

  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [url, setUrl] = useState(meetingUrl || '');

  useEffect(() => {
    if (!url && appointmentId) {
      const cleanId = String(appointmentId).replace(/[^a-zA-Z0-9]/g, '');
      const roomName = `Medzoos_${cleanId}`;
      const patientName = encodeURIComponent('Patient');
      setUrl(`https://meet.element.io/${roomName}#config.prejoinPageEnabled=false&config.requireDisplayName=false&config.disableDeepLinking=true&config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName="${patientName}"`);
    }
  }, [appointmentId, url]);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Main Full-Screen Video Background */}
      <View style={StyleSheet.absoluteFill}>
        {url ? (
          <WebView
            source={{ uri: url }}
            style={styles.webVideo}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            setSupportMultipleWindows={false}
            userAgent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            originWhitelist={['*']}
            onShouldStartLoadWithRequest={(request) => {
              if (
                request.url.startsWith('intent:') ||
                request.url.startsWith('jitsi-meet:') ||
                request.url.startsWith('market:') ||
                request.url.includes('play.google.com') ||
                request.url.includes('apps.apple.com')
              ) {
                return false;
              }
              return true;
            }}
          />
        ) : (
          <View style={styles.fallbackStage}>
            {doctorImage ? (
              <Image source={{ uri: doctorImage }} style={styles.fallbackImage} />
            ) : (
              <View style={styles.fallbackAvatar}>
                <Icon name="account" size={72} color="#94A3B8" />
              </View>
            )}
            <Text style={styles.fallbackName}>{doctorName || 'Dr. Abdullah Warraich'}</Text>
            <Text style={styles.fallbackSub}>Video Consultation Room</Text>
          </View>
        )}
      </View>

      {/* Top Overlay Controls */}
      <View style={[styles.topOverlay, { paddingTop: insets.top + (Platform.OS === 'ios' ? 8 : 16) }]}>
        <Pressable
          style={styles.backCircleBtn}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back">
          <Icon name="arrow-left" size={20} color="#0F172A" />
        </Pressable>

        <View style={styles.timerPill}>
          <View style={styles.redDot} />
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        </View>
      </View>

      {/* Floating Self-View Picture-in-Picture (PiP) Inset */}
      <View style={[styles.pipContainer, { bottom: insets.bottom + 110 }]}>
        {isVideoOff ? (
          <View style={styles.pipAvatarFallback}>
            <Icon name="camera-off" size={24} color="#94A3B8" />
            <Text style={styles.pipOffText}>Cam Off</Text>
          </View>
        ) : (
          <View style={styles.pipVideoBox}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' }}
              style={styles.pipImage}
            />
            <View style={styles.pipTag}>
              <Text style={styles.pipTagText}>You</Text>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Floating Translucent Action Controls Dock */}
      <View style={[styles.bottomDockContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.actionDock}>
          {/* Mute Button */}
          <Pressable
            style={[styles.dockBtn, isMuted && styles.dockBtnActive]}
            onPress={() => setIsMuted(!isMuted)}>
            <Icon
              name={isMuted ? 'microphone-off' : 'microphone'}
              size={22}
              color={isMuted ? '#EF4444' : '#0F172A'}
            />
          </Pressable>

          {/* Camera Button */}
          <Pressable
            style={[styles.dockBtn, isVideoOff && styles.dockBtnActive]}
            onPress={() => setIsVideoOff(!isVideoOff)}>
            <Icon
              name={isVideoOff ? 'video-off' : 'video'}
              size={22}
              color={isVideoOff ? '#EF4444' : '#0F172A'}
            />
          </Pressable>

          {/* Speaker Button */}
          <Pressable
            style={[styles.dockBtn, !isSpeakerOn && styles.dockBtnActive]}
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}>
            <Icon
              name={isSpeakerOn ? 'volume-high' : 'volume-off'}
              size={22}
              color={!isSpeakerOn ? '#EF4444' : '#0F172A'}
            />
          </Pressable>

          {/* End Call Button */}
          <Pressable
            style={styles.endCallBtn}
            onPress={() => navigation.goBack()}>
            <Icon name="phone-hangup" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webVideo: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fallbackStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    padding: 24,
  },
  fallbackImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fallbackAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  fallbackName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  fallbackSub: {
    fontSize: 14,
    color: '#94A3B8',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 20,
  },
  backCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  pipContainer: {
    position: 'absolute',
    right: 20,
    width: 110,
    height: 150,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 15,
  },
  pipVideoBox: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  pipImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  pipTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pipTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  pipAvatarFallback: {
    flex: 1,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipOffText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  bottomDockContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  actionDock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  dockBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  endCallBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
