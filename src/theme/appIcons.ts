import { radius } from './spacing';
import { iconScheme } from './healthOs';

/** Soft icon tiles — separate from button colors */
export const appIcons = {
  color: iconScheme.color,
  bg: iconScheme.bg,
  border: iconScheme.border,
  arrowBg: iconScheme.arrowBg,
  size: {
    sm: 18,
    md: 20,
    lg: 22,
    xl: 24,
  },
  tile: {
    sm: 36,
    md: 44,
    lg: 48,
  },
} as const;

export type AppIconTileSize = keyof typeof appIcons.tile;

export function appIconTile(size: AppIconTileSize = 'md') {
  const dim = appIcons.tile[size];
  return {
    width: dim,
    height: dim,
    borderRadius: radius.lg,
    backgroundColor: appIcons.bg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: appIcons.border,
  };
}

export function appIconArrowChip() {
  return {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: appIcons.arrowBg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
}
