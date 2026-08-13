import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { navigateToDrawerScreen } from '../../../lib/auth/navigation';
import { SupportContactCard } from '../components/SupportContactCard';
import { colors, spacing, TAB_BAR_CLEARANCE } from '../../../theme';

function SupportContent() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) },
      ]}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.subtitle}>
        Get help with orders, bookings, prescriptions, or account issues. Our
        team is available around the clock.
      </Text>

      <SupportContactCard
        onHelpCenter={() => navigateToDrawerScreen(navigation, 'Help')}
      />

      <Text style={styles.faqTitle}>Common topics</Text>
      {[
        'Track medicine order delivery',
        'Reschedule doctor appointment',
        'Download lab test report',
        'Update delivery address',
        'Payment & refund questions',
      ].map(topic => (
        <Text key={topic} style={styles.faqItem}>
          · {topic}
        </Text>
      ))}
    </ScrollView>
  );
}

export function SupportScreen() {
  return (
    <ScreenLayout headerMode="stack" title="Support" showSearch={false}>
      <SupportContent />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: spacing.lg },
  subtitle: {
    fontSize: 14,
    color: colors.neutral500,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  faqItem: {
    fontSize: 14,
    color: colors.neutral600,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
});
