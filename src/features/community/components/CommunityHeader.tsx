import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '../../../theme';
import { communityBrand } from '../communityBrand';
import { TabScreenHeroHeader } from '../../../components/navigation/TabScreenHeroHeader';

type CommunityHeaderProps = {
  title?: string;
  subtitle?: string;
  onBackPress?: () => void;
};

/**
 * Community gather header — back + shared title format (no notifications).
 */
export function CommunityHeader({
  title = 'Community',
  subtitle = 'Share, join groups, and grow healthier together.',
  onBackPress,
}: CommunityHeaderProps) {
  return (
    <TabScreenHeroHeader
      screenTitle="Community"
      pageBackground={communityBrand.page}
      cardBackground={communityBrand.accent}
      onBackPress={onBackPress}
      cardStyle={styles.cardInner}>
      <View style={styles.heroCopy}>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSub} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.peopleMark}>
        <Icon
          name="account-group"
          size={26}
          color={communityBrand.onAccent}
        />
      </View>
    </TabScreenHeroHeader>
  );
}

const styles = StyleSheet.create({
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: communityBrand.onAccent,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: 'rgba(255,255,255,0.82)',
  },
  peopleMark: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
