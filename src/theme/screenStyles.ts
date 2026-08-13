import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { calmLayout } from './calmLayout';
import { spacing } from './spacing';
import { TAB_BAR_CLEARANCE } from './layout';

/** Shared screen scroll + section layout for calm Health OS screens */
export const screenStyles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: calmLayout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: TAB_BAR_CLEARANCE + calmLayout.contentBottom,
    gap: calmLayout.sectionGap,
  },
  scrollContentCompact: {
    paddingHorizontal: calmLayout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: TAB_BAR_CLEARANCE + spacing.lg,
    gap: calmLayout.blockGap,
  },
  block: {
    gap: calmLayout.blockGap,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink900,
    letterSpacing: -0.2,
  },
});
