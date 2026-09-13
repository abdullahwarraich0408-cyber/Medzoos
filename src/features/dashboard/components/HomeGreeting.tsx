import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../../theme';
import { homeBrand } from '../homeBrand';
import { BrandGradientFill } from '../../../components/branding/TealGradientFill';

type HomeGreetingProps = {
  firstName: string;
  fullName?: string;
  locationLabel?: string;
  searchQuery: string;
  onChangeSearch: (value: string) => void;
  onSubmitSearch: () => void;
  onMenuPress?: () => void;
  onLocationPress?: () => void;
  onNotificationsPress?: () => void;
  unreadCount?: number;
};

/**
 * Full-bleed dark trust header — menu, location, greeting, search.
 * Brand teal gradient left → right behind content.
 */
export function HomeGreeting({
  firstName,
  fullName,
  locationLabel = 'Pakistan',
  searchQuery,
  onChangeSearch,
  onSubmitSearch,
  onMenuPress,
  onLocationPress,
  onNotificationsPress,
  unreadCount = 0,
}: HomeGreetingProps) {
  const insets = useSafeAreaInsets();
  const displayName = (fullName?.trim() || firstName || 'there').split(' ')[0];

  const locationTitle = useMemo(() => {
    const label = (locationLabel || 'Pakistan').trim();
    // Prefer city/area only — drop long address tails
    const short = label.split(',')[0]?.trim() || label;
    if (short.length <= 14) return short;
    return `${short.slice(0, 12).trim()}…`;
  }, [locationLabel]);

  const topPad =
    Math.max(insets.top, Platform.OS === 'android' ? 12 : 0) + spacing.sm;

  return (
    <View style={styles.header}>
      <BrandGradientFill
        baseColor={homeBrand.header}
        style={StyleSheet.absoluteFillObject}
      />
      <View
        style={[
          styles.content,
          {
            paddingTop: topPad,
            paddingLeft: Math.max(insets.left, spacing.lg),
            paddingRight: Math.max(insets.right, spacing.lg),
          },
        ]}>
        <View style={styles.topRow}>
          <Pressable
            style={({ pressed }) => [styles.iconOutline, pressed && styles.pressed]}
            onPress={onMenuPress}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            hitSlop={6}>
            <Icon name="menu" size={20} color={homeBrand.onMain} />
          </Pressable>

          <View style={styles.topActions}>
            {onNotificationsPress ? (
              <Pressable
                style={({ pressed }) => [styles.iconOutline, pressed && styles.pressed]}
                onPress={onNotificationsPress}
                accessibilityLabel="Notifications"
                hitSlop={6}>
                <Icon name="bell-outline" size={18} color={homeBrand.onMain} />
                {unreadCount > 0 ? <View style={styles.notifDot} /> : null}
              </Pressable>
            ) : null}

            <Pressable
              style={({ pressed }) => [styles.locationChip, pressed && styles.pressed]}
              onPress={onLocationPress}
              accessibilityRole="button"
              accessibilityLabel={`Current location ${locationTitle}`}>
              <Icon name="map-marker" size={14} color={homeBrand.onMain} />
              <Text style={styles.locationName} numberOfLines={1}>
                {locationTitle}
              </Text>
              <Icon name="chevron-down" size={14} color="rgba(255,255,255,0.8)" />
            </Pressable>
          </View>
        </View>

        <View style={styles.greetingBlock}>
          <Text style={styles.helloText} numberOfLines={1}>
            Hello, {displayName}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            Find the best medical care for you
          </Text>
        </View>

        <View style={styles.searchWrap}>
          <Pressable style={styles.searchBar} onPress={onSubmitSearch}>
            <Icon name="magnify" size={20} color={homeBrand.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors, specialties..."
              placeholderTextColor={homeBrand.muted}
              value={searchQuery}
              onChangeText={onChangeSearch}
              onSubmitEditing={onSubmitSearch}
              returnKeyType="search"
            />
            <View style={styles.filterBtn}>
              <Icon name="tune-variant" size={18} color={homeBrand.main} />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: homeBrand.header,
    overflow: 'hidden',
  },
  content: {
    zIndex: 1,
    elevation: Platform.OS === 'android' ? 2 : 0,
    paddingBottom: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  topActions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    minWidth: 0,
  },
  iconOutline: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.error,
    borderWidth: 1,
    borderColor: homeBrand.main,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 128,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  locationName: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '700',
    color: homeBrand.onMain,
  },
  greetingBlock: {
    marginTop: spacing.lg,
    gap: 4,
    paddingRight: spacing.md,
  },
  helloText: {
    fontSize: 24,
    fontWeight: '700',
    color: homeBrand.onMain,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 18,
  },
  searchWrap: {
    marginTop: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingLeft: 16,
    paddingRight: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: homeBrand.main,
    padding: 0,
    margin: 0,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: homeBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
  },
});
