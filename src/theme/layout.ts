import { Platform, StatusBar } from 'react-native';
import { spacing } from './spacing';

/** Inner height of the floating tab pill (icons + labels). */
export const TAB_BAR_HEIGHT = 64;

/** Extra space so the raised Copilot button does not cover screen content. */
export const TAB_BAR_CENTER_LIFT = 24;

/**
 * Scroll padding so content clears the floating (overlay) tab bar.
 * Includes center FAB lift + pill height + breathing room.
 * Safe-area inset is handled separately via getTabBarOccupiedHeight when needed.
 */
export const TAB_BAR_CLEARANCE =
  TAB_BAR_CENTER_LIFT + TAB_BAR_HEIGHT + spacing.xxl;

/** Vertical padding inside stack header rows — matches Pharmacies / TopNavigation. */
export const STACK_HEADER_ROW_PAD_V = spacing.sm;

export function getTabBarOccupiedHeight(bottomInset: number) {
  return (
    TAB_BAR_CENTER_LIFT +
    TAB_BAR_HEIGHT +
    Math.max(bottomInset, 12)
  );
}

/**
 * Safe-area top inset for stack headers (Pharmacies baseline).
 * Does not include row padding — add STACK_HEADER_ROW_PAD_V separately.
 */
export function getStackHeaderTopInset(safeTop: number) {
  return Math.max(
    safeTop,
    Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  );
}

/** Full paddingTop for custom stack headers that fold row pad into the shell. */
export function getStackHeaderPaddingTop(safeTop: number) {
  return getStackHeaderTopInset(safeTop) + STACK_HEADER_ROW_PAD_V;
}
