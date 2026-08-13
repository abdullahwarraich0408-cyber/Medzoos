import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { YouStackParamList } from '../../../navigation/types';
import { colors, spacing } from '../../../theme';

type VideoRoute = RouteProp<YouStackParamList, 'AppointmentVideo'>;
type VideoNav = NativeStackNavigationProp<YouStackParamList, 'AppointmentVideo'>;

export function AppointmentVideoScreen() {
  const navigation = useNavigation<VideoNav>();
  const route = useRoute<VideoRoute>();
  const insets = useSafeAreaInsets();
  const { doctorName, doctorImage, slot } = route.params;
  const [seconds, setSeconds] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const connectTimer = setTimeout(() => setConnected(true), 1800);
    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (!connected) return;
    const tick = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(tick);
  }, [connected]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
      <StatusBar barStyle="light-content" backgroundColor="#082B3F" />
      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => [styles.closeBtn, pressed && styles.closePressed]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="End or leave call"
          hitSlop={8}>
          <Icon name="arrow-left" size={22} color={colors.white} />
        </Pressable>
        <View style={styles.topCopy}>
          <Text style={styles.status}>
            {connected ? 'Connected' : 'Connecting…'}
          </Text>
          <Text style={styles.timer}>{connected ? `${mm}:${ss}` : '—'}</Text>
        </View>
        <View style={styles.sideSlot} />
      </View>

      <View style={styles.stage}>
        {doctorImage ? (
          <Image source={{ uri: doctorImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Icon name="account" size={48} color={colors.primary700} />
          </View>
        )}
        <Text style={styles.name}>{doctorName}</Text>
        <Text style={styles.meta}>
          {connected
            ? 'Video consultation in progress'
            : `Joining call scheduled for ${slot || 'today'}`}
        </Text>
      </View>

      <View
        style={[
          styles.controls,
          { paddingBottom: Math.max(insets.bottom, spacing.lg) },
        ]}>
        <Pressable style={styles.controlBtn}>
          <Icon name="microphone" size={22} color={colors.white} />
        </Pressable>
        <Pressable style={styles.controlBtn}>
          <Icon name="video" size={22} color={colors.white} />
        </Pressable>
        <Pressable
          style={[styles.controlBtn, styles.endBtn]}
          onPress={() => navigation.goBack()}>
          <Icon name="phone-hangup" size={22} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#082B3F',
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    gap: spacing.sm,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  closePressed: {
    opacity: 0.85,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  topCopy: {
    flex: 1,
    alignItems: 'center',
  },
  sideSlot: {
    width: 44,
    height: 44,
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  timer: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary100,
    marginBottom: spacing.md,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
  },
  meta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBtn: {
    backgroundColor: colors.error,
  },
});
