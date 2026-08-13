import { colors } from './colors';

/** Soft specialty / UI icon tiles — not primary button fill */
export const iconScheme = {
  color: colors.iconPrimary,
  bg: colors.primary100,
  border: 'rgba(8, 43, 63, 0.06)',
  arrowBg: colors.primary200,
} as const;

/** Health OS design tokens — calm, readable, minimal */
export const healthOs = {
  scoreGradient: ['#082B3F', '#17618E'] as const,
  scoreRingTrack: colors.primary100,
  cardBorder: colors.border,
  copilotGlow: '#6366F1',
  copilotGlowDark: '#4F46E5',
  copilotSurface: '#EEF2FF',
  doctorBlue: '#2563EB',
  doctorBlueBg: '#EFF6FF',
  labGreen: '#059669',
  labGreenBg: '#ECFDF5',
  rxPurple: '#7C3AED',
  rxPurpleBg: '#F5F3FF',
  liveGreen: '#16A34A',
  liveGreenBg: '#F0FDF4',
  liveGreenBorder: '#BBF7D0',
  missionGold: '#F59E0B',
  missionGoldBg: '#FEF3C7',
  communityViolet: colors.primary700,
  communitySurface: colors.primary100,
  streakFire: '#EF4444',
  streakFireBg: '#FEE2E2',
  emergencyRed: '#DC2626',
  emergencyBg: '#FEE2E2',
  iconScheme,
  iconColor: iconScheme.color,
  iconSurface: iconScheme.bg,
  inputBorder: colors.neutral200,
  glassWhite: 'rgba(255, 255, 255, 0.92)',
  tabBarLight: colors.white,
  tabBarDark: '#1C1C1E',
  tabBarCopilot: '#6366F1',
  messageBg: colors.surfaceSubtle,
  messageBorder: colors.neutral200,
} as const;

/** Typography tuned for readable, clear messages */
export const healthOsTypography = {
  display: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.3 },
  greeting: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.2 },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, color: colors.textPrimary },
  sectionHint: { fontSize: 13, fontWeight: '400' as const, lineHeight: 20, color: colors.textSecondary },
  messageTitle: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22, color: colors.textPrimary },
  messageBody: { fontSize: 15, fontWeight: '400' as const, lineHeight: 24, color: colors.primary800 },
  messageCaption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 20, color: colors.textSecondary },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.3, color: colors.textMuted },
  metric: { fontSize: 28, fontWeight: '700' as const },
  metricLabel: { fontSize: 12, fontWeight: '500' as const, color: colors.textMuted },
} as const;
