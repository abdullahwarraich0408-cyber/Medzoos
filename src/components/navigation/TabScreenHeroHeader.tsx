import React, { type ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStackHeaderPaddingTop } from '../../theme/layout';
import { appBrand, stackScreenTitleStyle } from '../../theme/appBrand';
import { tabHeroBanner, tabHeroCardShadow } from '../../theme/tabHeroBanner';
import { StackBackButton } from './StackBackButton';
import { BrandGradientFill } from '../branding/TealGradientFill';

type TabScreenHeroHeaderProps = {
  /** Centered uppercase kicker (e.g. Health vault, Community, You). */
  screenTitle: string;
  pageBackground: string;
  /** Brand card color — gradient only adds depth on top of this. */
  cardBackground?: string;
  onBackPress?: () => void;
  children: ReactNode;
  /** Optional extra style on the fixed-size card (e.g. flexDirection). */
  cardStyle?: StyleProp<ViewStyle>;
};

/**
 * Shared tab-root header: back + title + brand card with soft gradient depth.
 * Gradient is a background layer; card content is a sibling so it never gets covered.
 */
export function TabScreenHeroHeader({
  screenTitle,
  pageBackground,
  cardBackground = appBrand.main,
  onBackPress,
  children,
  cardStyle,
}: TabScreenHeroHeaderProps) {
  const insets = useSafeAreaInsets();
  const topPad = getStackHeaderPaddingTop(insets.top);

  return (
    <View
      style={[
        styles.shell,
        {
          paddingTop: topPad,
          paddingLeft: Math.max(insets.left, tabHeroBanner.horizontalInset),
          paddingRight: Math.max(insets.right, tabHeroBanner.horizontalInset),
          backgroundColor: pageBackground,
        },
      ]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.topBar}>
        <StackBackButton onPress={() => onBackPress?.()} />
        <Text style={styles.kicker} pointerEvents="none">
          {screenTitle}
        </Text>
        <View style={styles.sideSlot} />
      </View>

      <View style={styles.card}>
        <BrandGradientFill
          baseColor={cardBackground}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.cardContent, cardStyle]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    paddingBottom: tabHeroBanner.shellPaddingBottom,
    gap: tabHeroBanner.shellGap,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  kicker: {
    flex: 1,
    ...stackScreenTitleStyle,
    marginHorizontal: 8,
  },
  sideSlot: {
    width: 44,
    height: 44,
  },
  card: {
    width: '100%',
    height: tabHeroBanner.height,
    borderRadius: tabHeroBanner.radius,
    overflow: 'hidden',
    backgroundColor: appBrand.main,
    ...tabHeroCardShadow,
  },
  cardContent: {
    ...StyleSheet.absoluteFillObject,
    padding: tabHeroBanner.padding,
    justifyContent: 'center',
    zIndex: 1,
    ...(Platform.OS === 'android' ? { elevation: 2 } : null),
  },
});
