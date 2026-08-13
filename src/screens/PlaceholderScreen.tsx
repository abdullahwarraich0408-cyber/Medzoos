import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { colors, spacing, radius, typography, TAB_BAR_CLEARANCE, cardStyles } from '../theme';

type PlaceholderScreenProps = {
  title: string;
  subtitle: string;
  icon: string;
  accent?: string;
};

export function PlaceholderScreen({
  title,
  subtitle,
  icon,
  accent = colors.brandPrimary,
}: PlaceholderScreenProps) {
  return (
    <ScreenLayout title={title} showSearch={false} showCart={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: `${accent}12` }]}>
          <View style={[styles.iconCircle, { backgroundColor: `${accent}20` }]}>
            <Icon name={icon} size={40} color={accent} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Coming soon</Text>
          <Text style={styles.cardBody}>
            This screen will connect to the same Medzoos API as the website.
            Navigation is ready — start building features here.
          </Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.brandPrimary}15`,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    color: colors.inkHeadline,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral600,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  card: {
    ...cardStyles.premiumSoft,
    padding: spacing.lg,
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.inkHeadline,
    marginBottom: spacing.sm,
  },
  cardBody: {
    ...typography.body,
    color: colors.neutral600,
    lineHeight: 22,
  },
});
