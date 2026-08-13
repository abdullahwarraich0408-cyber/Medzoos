import React, { useState, type ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows, typography } from '../../theme';

type TopNavigationProps = {
  mode?: 'main' | 'stack';
  title?: string;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  onCartPress?: () => void;
  onNotificationsPress?: () => void;
  cartCount?: number;
  unreadCount?: number;
  showSearch?: boolean;
  showCart?: boolean;
  showBack?: boolean;
  showNotifications?: boolean;
  /** Stack headers on drawer routes show menu instead of a dead back button. */
  showMenu?: boolean;
  /** Optional right-side control for stack headers (overrides cart when set). */
  headerRight?: ReactNode;
  /** Optional center content for stack headers (overrides title when set). */
  headerCenter?: ReactNode;
};

export function TopNavigation({
  mode = 'main',
  title,
  onBackPress,
  onMenuPress,
  onCartPress,
  onNotificationsPress,
  cartCount = 0,
  unreadCount = 0,
  showSearch = false,
  showCart = true,
  showBack = true,
  showNotifications = true,
  showMenu = false,
  headerRight,
  headerCenter,
}: TopNavigationProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  if (mode === 'stack') {
    return (
      <View style={[styles.wrapper, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <View style={styles.stackRow}>
          {showMenu ? (
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              onPress={onMenuPress}
              accessibilityLabel="Open menu"
              hitSlop={8}>
              <Icon name="menu" size={22} color={colors.primary900} />
            </Pressable>
          ) : showBack ? (
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              onPress={onBackPress}
              accessibilityLabel="Go back"
              hitSlop={8}>
              <Icon name="arrow-left" size={22} color={colors.primary900} />
            </Pressable>
          ) : (
            <View style={styles.sideSlot} />
          )}

          {headerCenter ? (
            <View style={styles.stackCenter}>{headerCenter}</View>
          ) : (
            <Text style={styles.stackTitle} numberOfLines={1}>
              {title ?? 'MedCare'}
            </Text>
          )}

          {headerRight ? (
            <View style={styles.sideSlot}>{headerRight}</View>
          ) : showCart ? (
            <Pressable
              style={({ pressed }) => [
                styles.cartBtn,
                pressed && styles.cartPressed,
              ]}
              onPress={onCartPress}
              accessibilityLabel="Cart">
              <Icon name="cart-outline" size={20} color={colors.iconWhite} />
              {cartCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          ) : (
            <View style={styles.sideSlot} />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.mainBody}>
        <View style={styles.mainRow}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={onMenuPress}
            accessibilityLabel="Open menu"
            hitSlop={8}>
            <Icon name="menu" size={22} color={colors.primary900} />
          </Pressable>

          <View style={styles.brandBlock}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Icon name="medical-bag" size={18} color={colors.primary700} />
              </View>
              <Text style={styles.logoText}>PharmaHub</Text>
            </View>
          </View>

          <View style={styles.actions}>
            {showNotifications ? (
              <Pressable
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && styles.pressed,
                ]}
                onPress={onNotificationsPress}
                accessibilityLabel="Notifications">
                <Icon name="bell-outline" size={21} color={colors.primary900} />
                {unreadCount > 0 ? <View style={styles.notifDot} /> : null}
              </Pressable>
            ) : null}

            {showCart ? (
              <Pressable
                style={({ pressed }) => [
                  styles.cartBtn,
                  pressed && styles.cartPressed,
                ]}
                onPress={onCartPress}
                accessibilityLabel="Cart">
                <Icon name="cart-outline" size={20} color={colors.iconWhite} />
                {cartCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {cartCount > 99 ? '99+' : cartCount}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            ) : null}
          </View>
        </View>

        {showSearch ? (
          <View style={styles.searchBar}>
            <Icon name="magnify" size={20} color={colors.primary700} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search medicines, doctors, labs..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && Platform.OS === 'android' ? (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <Icon name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const ICON_SIZE = 44;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
  },
  mainBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: ICON_SIZE,
  },
  brandBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    ...typography.logo,
    color: colors.primary900,
    letterSpacing: -0.4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceBlue,
  },
  pressed: {
    opacity: 0.88,
    backgroundColor: colors.primary100,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  cartBtn: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: colors.primary700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartPressed: {
    opacity: 0.9,
    backgroundColor: colors.primary900,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.cardSoft,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
  stackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 52,
    gap: spacing.sm,
  },
  stackTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary900,
    letterSpacing: -0.2,
  },
  stackCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },
  sideSlot: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
