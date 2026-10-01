import React, { type ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../theme';
import { appBrand } from '../../theme/appBrand';
import { tabHeroBanner } from '../../theme/tabHeroBanner';
import { StackBackButton } from './StackBackButton';
import { AuthGradientHeader } from '../../features/auth/components/AuthGradientHeader';

type TabScreenHeroHeaderProps = {
  /** Centered uppercase kicker (e.g. Health vault, Community, You). */
  screenTitle: string;
  /** @deprecated Ignored — header uses the same AuthGradientHeader as Home / Sign In. */
  pageBackground?: string;
  /** @deprecated Ignored — gradient stops match Sign In / Home. */
  cardBackground?: string;
  onBackPress?: () => void;
  children: ReactNode;
  /** Optional extra style on the hero body. */
  cardStyle?: StyleProp<ViewStyle>;
  /** Optional trailing control (e.g. Medzoos new-chat). */
  headerRight?: ReactNode;
};

/**
 * Shared tab-root header — same AuthGradientHeader wash as Home & Sign In
 * (#00A3A8 → #006D72 → #003E42, left → right). Content sits inside the gradient.
 */
export function TabScreenHeroHeader({
  screenTitle,
  onBackPress,
  children,
  cardStyle,
  headerRight,
}: TabScreenHeroHeaderProps) {
  const insets = useSafeAreaInsets();
  const topPad =
    Math.max(insets.top, Platform.OS === 'android' ? 12 : 0) + spacing.sm;

  return (
    <AuthGradientHeader
      style={[
        styles.header,
        {
          paddingTop: topPad,
          paddingBottom: tabHeroBanner.shellPaddingBottom,
          paddingLeft: Math.max(insets.left, tabHeroBanner.horizontalInset),
          paddingRight: Math.max(insets.right, tabHeroBanner.horizontalInset),
        },
      ]}>
      <View style={styles.topBar}>
        <StackBackButton light onPress={() => onBackPress?.()} />
        <Text style={styles.kicker} pointerEvents="none" numberOfLines={1}>
          {screenTitle}
        </Text>
        <View style={styles.sideSlot}>
          {headerRight ?? <View style={styles.sidePlaceholder} />}
        </View>
      </View>

      <View style={[styles.heroBody, cardStyle]}>{children}</View>
    </AuthGradientHeader>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    alignSelf: 'stretch',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  kicker: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: appBrand.onMain,
    textAlign: 'center',
  },
  sideSlot: {
    minWidth: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  sidePlaceholder: {
    width: 44,
    height: 44,
  },
  heroBody: {
    marginTop: tabHeroBanner.shellGap,
    minHeight: 112,
    zIndex: 1,
  },
});
