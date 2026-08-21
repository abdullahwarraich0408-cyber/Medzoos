import React, { useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme';
import {
  TAB_BAR_CENTER_LIFT,
  TAB_BAR_HEIGHT,
  getTabBarOccupiedHeight,
} from '../../theme/layout';
import type { MainTabParamList } from '../../navigation/types';
import { getTabRootScreen } from '../../navigation/tabBarVisibility';

const COPILOT_MARK = require('../../assets/branding/tab-copilot-mark.png');

type TabConfig = {
  name: keyof MainTabParamList;
  label: string;
  icon: string;
  iconFocused: string;
  isCenter?: boolean;
};

const TABS: TabConfig[] = [
  { name: 'Home', label: 'Home', icon: 'home', iconFocused: 'home' },
  { name: 'Health', label: 'Health', icon: 'heart', iconFocused: 'heart' },
  {
    name: 'Copilot',
    label: 'Medzoos',
    icon: 'robot',
    iconFocused: 'robot',
    isCenter: true,
  },
  {
    name: 'Community',
    label: 'Community',
    icon: 'account-group',
    iconFocused: 'account-group',
  },
  { name: 'You', label: 'You', icon: 'account', iconFocused: 'account' },
];

const BAR_H_PADDING = 4;
const CENTER_SIZE = 44;
const CENTER_RING = 50;
const ICON_SIZE = 22;

type CustomBottomTabBarProps = BottomTabBarProps & {
  visible?: boolean;
};

function getActiveTabIndex(state: BottomTabBarProps['state']) {
  const activeRoute = state.routes[state.index];
  if (!activeRoute) return 0;
  const configIndex = TABS.findIndex(tab => tab.name === activeRoute.name);
  return configIndex >= 0 ? configIndex : state.index;
}

function SideTab({
  label,
  icon,
  iconFocused,
  isFocused,
  onPress,
  onLongPress,
  disabled,
  accessibilityLabel,
}: {
  label: string;
  icon: string;
  iconFocused: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  disabled: boolean;
  accessibilityLabel: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      style={styles.tabCell}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() =>
        Animated.spring(scale, {
          toValue: 0.94,
          useNativeDriver: true,
          friction: 6,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 5,
        }).start()
      }
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused, disabled }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}>
      <Animated.View style={[styles.tabInner, { transform: [{ scale }] }]}>
        {/* Circle highlight — solid bg avoids Android transparent+overflow icon bug */}
        <View
          style={[
            styles.iconCircle,
            isFocused ? styles.iconCircleActive : styles.iconCircleIdle,
          ]}>
          <Icon
            name={(isFocused ? iconFocused : icon) as never}
            size={ICON_SIZE}
            color={isFocused ? colors.primary700 : '#415F78'}
            style={styles.tabIcon}
          />
        </View>
        <Text
          style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
          numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function BottomTabBar({
  state,
  navigation,
  descriptors,
  visible = true,
}: CustomBottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeIndex = getActiveTabIndex(state);
  const bottomPad = visible ? Math.max(insets.bottom, 12) : 0;
  const occupiedHeight = visible ? getTabBarOccupiedHeight(insets.bottom) : 0;

  const handleTabPress = (index: number, isFocused: boolean) => {
    const route = state.routes.find(r => r.name === TABS[index]?.name);
    if (!route) return;

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (event.defaultPrevented) return;

    const tabName = route.name as keyof MainTabParamList;
    const rootScreen = getTabRootScreen(tabName);
    const routeStateIndex = state.routes.findIndex(r => r.key === route.key);
    const nestedIndex =
      routeStateIndex >= 0
        ? (state.routes[routeStateIndex].state?.index ?? 0)
        : 0;

    if (isFocused && rootScreen && nestedIndex > 0) {
      navigation.dispatch(
        CommonActions.navigate({
          name: route.name,
          params: { screen: rootScreen },
          merge: true,
        }),
      );
      return;
    }

    if (!isFocused) {
      if (rootScreen) {
        navigation.navigate(route.name, { screen: rootScreen });
      } else {
        navigation.navigate(route.name);
      }
    }
  };

  const centerIndex = TABS.findIndex(t => t.isCenter);
  const centerFocused = activeIndex === centerIndex;
  const fabScale = useRef(new Animated.Value(1)).current;

  return (
    <View
      style={[
        styles.shell,
        { height: occupiedHeight },
        !visible && styles.shellHidden,
      ]}
      pointerEvents={visible ? 'box-none' : 'none'}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}>
      <View
        style={[styles.wrapper, { paddingBottom: bottomPad }]}
        pointerEvents={visible ? 'box-none' : 'none'}>
        <View
          style={styles.barStage}
          pointerEvents={visible ? 'box-none' : 'none'}>
          <View
            style={[styles.floatingBar, !visible && styles.floatingBarHidden]}>
            <View
              style={styles.barInner}
              pointerEvents={visible ? 'auto' : 'none'}>
              {TABS.map((tab, index) => {
                const route = state.routes.find(r => r.name === tab.name);
                if (!route) return null;

                const isFocused = activeIndex === index;

                if (tab.isCenter) {
                  return (
                    <View key={tab.name} style={styles.centerSlot}>
                      <Text
                        style={[
                          styles.centerLabel,
                          isFocused && styles.centerLabelActive,
                        ]}>
                        {tab.label}
                      </Text>
                    </View>
                  );
                }

                return (
                  <SideTab
                    key={tab.name}
                    label={tab.label}
                    icon={tab.icon}
                    iconFocused={tab.iconFocused}
                    isFocused={isFocused}
                    disabled={!visible}
                    accessibilityLabel={
                      descriptors[route.key]?.options
                        .tabBarAccessibilityLabel ?? tab.label
                    }
                    onPress={() => handleTabPress(index, isFocused)}
                    onLongPress={() =>
                      navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                      })
                    }
                  />
                );
              })}
            </View>
          </View>

          <View style={styles.centerFabSlot} pointerEvents="box-none">
            <Pressable
              style={styles.centerFab}
              onPress={() => handleTabPress(centerIndex, centerFocused)}
              onPressIn={() =>
                Animated.spring(fabScale, {
                  toValue: 0.94,
                  useNativeDriver: true,
                  friction: 6,
                }).start()
              }
              onPressOut={() =>
                Animated.spring(fabScale, {
                  toValue: 1,
                  useNativeDriver: true,
                  friction: 5,
                }).start()
              }
              onLongPress={() => {
                const route = state.routes.find(r => r.name === 'Copilot');
                if (route) {
                  navigation.emit({ type: 'tabLongPress', target: route.key });
                }
              }}
              disabled={!visible}
              accessibilityRole="button"
              accessibilityState={{
                selected: centerFocused,
                disabled: !visible,
              }}
              accessibilityLabel="Medzoos">
              <Animated.View
                style={[
                  styles.centerRing,
                  centerFocused && styles.centerRingActive,
                  { transform: [{ scale: fabScale }] },
                ]}>
                <View
                  style={[
                    styles.centerBtn,
                    centerFocused && styles.centerBtnActive,
                  ]}>
                  <Image
                    source={COPILOT_MARK}
                    style={styles.centerLogo}
                    resizeMode="contain"
                  />
                </View>
              </Animated.View>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  shellHidden: {
    height: 0,
    overflow: 'hidden',
    opacity: 0,
  },
  wash: {
    ...StyleSheet.absoluteFill,
  },
  wrapper: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingTop: TAB_BAR_CENTER_LIFT,
    overflow: 'visible',
  },
  barStage: {
    width: '100%',
    maxWidth: 420,
    overflow: 'visible',
  },
  floatingBar: {
    width: '100%',
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(8, 43, 63, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#082B3F',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
    }),
  },
  floatingBarHidden: {
    opacity: 0,
  },
  barInner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: TAB_BAR_HEIGHT,
    paddingHorizontal: BAR_H_PADDING,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconCircleIdle: {
    backgroundColor: 'rgba(222, 238, 249, 0.35)',
  },
  iconCircleActive: {
    backgroundColor: colors.primary100,
  },
  tabIcon: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
    color: '#415F78',
    textAlign: 'center',
    marginTop: 1,
  },
  tabLabelActive: {
    color: colors.primary800,
    fontWeight: '700',
  },
  centerSlot: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
    paddingTop: 28,
  },
  centerFabSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: TAB_BAR_HEIGHT - 20,
    alignItems: 'center',
    zIndex: 20,
  },
  centerFab: {
    width: CENTER_RING + 4,
    height: CENTER_RING + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerRing: {
    width: CENTER_RING,
    height: CENTER_RING,
    borderRadius: CENTER_RING / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary100,
    borderWidth: 1,
    borderColor: colors.primary200,
  },
  centerRingActive: {
    backgroundColor: colors.primary200,
    borderColor: colors.primary400,
  },
  centerBtn: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary200,
    ...Platform.select({
      ios: {
        shadowColor: '#082B3F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.14,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  centerBtnActive: {
    borderColor: colors.primary700,
  },
  centerLogo: {
    width: 26,
    height: 26,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.1,
    color: '#415F78',
  },
  centerLabelActive: {
    color: colors.primary800,
    fontWeight: '700',
  },
});
