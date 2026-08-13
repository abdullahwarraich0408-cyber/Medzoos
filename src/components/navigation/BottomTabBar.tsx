import React from 'react';

import {

  View,

  Text,

  Pressable,

  StyleSheet,

  Platform,

} from 'react-native';

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { CommonActions } from '@react-navigation/native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { colors, spacing, typography, shadows } from '../../theme';

import { healthOs } from '../../theme/healthOs';

import type { MainTabParamList } from '../../navigation/types';

import { getTabRootScreen } from '../../navigation/tabBarVisibility';



type TabConfig = {

  name: keyof MainTabParamList;

  label: string;

  icon: string;

  iconFocused: string;

  isCenter?: boolean;

};



const TABS: TabConfig[] = [

  { name: 'Home', label: 'Home', icon: 'home-outline', iconFocused: 'home' },

  { name: 'Health', label: 'Health', icon: 'heart-pulse', iconFocused: 'heart-pulse' },

  {

    name: 'Copilot',

    label: 'Copilot',

    icon: 'robot-outline',

    iconFocused: 'robot',

    isCenter: true,

  },

  { name: 'Community', label: 'Community', icon: 'account-group-outline', iconFocused: 'account-group' },

  { name: 'You', label: 'You', icon: 'account-outline', iconFocused: 'account' },

];



const BAR_HEIGHT = 60;

const BAR_H_PADDING = 8;

const CENTER_SIZE = 52;

const CENTER_LIFT = 18;



type CustomBottomTabBarProps = BottomTabBarProps & {

  visible?: boolean;

};



function getActiveTabIndex(state: BottomTabBarProps['state']) {

  const activeRoute = state.routes[state.index];

  if (!activeRoute) return 0;



  const configIndex = TABS.findIndex(tab => tab.name === activeRoute.name);

  return configIndex >= 0 ? configIndex : state.index;

}



export function BottomTabBar({

  state,

  navigation,

  descriptors,

  visible = true,

}: CustomBottomTabBarProps) {

  const insets = useSafeAreaInsets();

  const activeIndex = getActiveTabIndex(state);



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



  return (

    <View

      style={[

        styles.wrapper,

        { paddingBottom: Math.max(insets.bottom, spacing.sm) },

        !visible && styles.wrapperHidden,

      ]}

      pointerEvents={visible ? 'box-none' : 'none'}

      accessibilityElementsHidden={!visible}

      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}>

      <View

        style={[styles.floatingBar, !visible && styles.floatingBarHidden]}

        pointerEvents={visible ? 'auto' : 'none'}>

        {TABS.map((tab, index) => {

          const route = state.routes.find(r => r.name === tab.name);

          if (!route) return null;



          const isFocused = activeIndex === index;



          const onLongPress = () => {

            navigation.emit({

              type: 'tabLongPress',

              target: route.key,

            });

          };



          if (tab.isCenter) {

            return (

              <Pressable

                key={tab.name}

                style={styles.centerCell}

                onPress={() => handleTabPress(index, isFocused)}

                onLongPress={onLongPress}

                disabled={!visible}

                accessibilityRole="button"

                accessibilityState={{ selected: isFocused, disabled: !visible }}

                accessibilityLabel="Health Copilot">

                <View style={[styles.centerBtn, isFocused && styles.centerBtnActive]}>

                  <Icon

                    name={isFocused ? tab.iconFocused : tab.icon}

                    size={24}

                    color={colors.white}

                  />

                </View>

                <Text style={[styles.centerLabel, isFocused && styles.centerLabelActive]}>

                  {tab.label}

                </Text>

              </Pressable>

            );

          }



          return (

            <Pressable

              key={tab.name}

              style={styles.tabCell}

              onPress={() => handleTabPress(index, isFocused)}

              onLongPress={onLongPress}

              disabled={!visible}

              accessibilityRole="button"

              accessibilityState={{ selected: isFocused, disabled: !visible }}

              accessibilityLabel={

                descriptors[route.key]?.options.tabBarAccessibilityLabel ??

                tab.label

              }

              android_ripple={{

                color: 'rgba(8, 43, 63, 0.08)',

                borderless: false,

              }}

              hitSlop={4}>

              <View style={styles.tabInner}>

                <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>

                  <Icon

                    name={isFocused ? tab.iconFocused : tab.icon}

                    size={20}

                    color={isFocused ? colors.iconWhite : colors.iconMuted}

                  />

                </View>

                <Text

                  style={[

                    styles.tabLabel,

                    isFocused ? styles.tabLabelActive : styles.tabLabelInactive,

                  ]}

                  numberOfLines={1}>

                  {tab.label}

                </Text>

              </View>

            </Pressable>

          );

        })}

      </View>

    </View>

  );

}



const styles = StyleSheet.create({

  wrapper: {

    position: 'absolute',

    left: 0,

    right: 0,

    bottom: 0,

    alignItems: 'center',

    paddingHorizontal: spacing.lg,

    zIndex: 1000,

    ...Platform.select({

      android: { elevation: 1000 },

    }),

  },

  wrapperHidden: {

    opacity: 0,

  },

  floatingBar: {

    flexDirection: 'row',

    alignItems: 'flex-end',

    width: '100%',

    maxWidth: 400,

    minHeight: BAR_HEIGHT,

    backgroundColor: colors.surface,

    borderRadius: 28,

    paddingHorizontal: BAR_H_PADDING,

    paddingBottom: spacing.xs,

    borderWidth: 1,

    borderColor: colors.borderLight,

    ...shadows.tabBar,

  },

  floatingBarHidden: {

    opacity: 0,

  },

  tabCell: {

    flex: 1,

    height: BAR_HEIGHT - spacing.xs,

    alignItems: 'center',

    justifyContent: 'center',

  },

  centerCell: {

    flex: 1,

    alignItems: 'center',

    justifyContent: 'flex-end',

    paddingBottom: 2,

  },

  centerBtn: {

    width: CENTER_SIZE,

    height: CENTER_SIZE,

    borderRadius: CENTER_SIZE / 2,

    backgroundColor: healthOs.copilotGlow,

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: -CENTER_LIFT,

    borderWidth: 3,

    borderColor: colors.white,

    ...Platform.select({

      ios: {

        shadowColor: healthOs.copilotGlow,

        shadowOffset: { width: 0, height: 4 },

        shadowOpacity: 0.35,

        shadowRadius: 10,

      },

      android: { elevation: 8 },

    }),

  },

  centerBtnActive: {
    backgroundColor: healthOs.copilotGlowDark,
  },

  centerLabel: {

    ...typography.subtitle,

    fontSize: 9,

    fontWeight: '600',

    color: colors.neutral500,

    marginTop: 2,

  },

  centerLabelActive: {

    color: healthOs.copilotGlow,

  },

  tabInner: {

    alignItems: 'center',

    justifyContent: 'center',

    gap: 2,

    paddingHorizontal: 4,

  },

  iconWrap: {

    width: 32,

    height: 28,

    borderRadius: 14,

    alignItems: 'center',

    justifyContent: 'center',

  },

  iconWrapActive: {

    backgroundColor: colors.primary700,

  },

  tabLabel: {

    ...typography.subtitle,

    fontSize: 9,

    fontWeight: '600',

    textAlign: 'center',

  },

  tabLabelActive: {

    color: colors.primary700,

  },

  tabLabelInactive: {

    color: colors.iconMuted,

  },

});

