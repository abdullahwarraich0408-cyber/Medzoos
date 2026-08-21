import { spacing } from './spacing';

/** Inner height of the floating tab pill (icons + labels). */
export const TAB_BAR_HEIGHT = 64;

/** Extra space so the raised Copilot button does not cover screen content. */
export const TAB_BAR_CENTER_LIFT = 24;

/**
 * Extra scroll padding above the tab-bar layout slot
 * (or above the home indicator when the bar is hidden).
 */
export const TAB_BAR_CLEARANCE = spacing.xxxl;

export function getTabBarOccupiedHeight(bottomInset: number) {
  return (
    TAB_BAR_CENTER_LIFT +
    TAB_BAR_HEIGHT +
    Math.max(bottomInset, 12)
  );
}
