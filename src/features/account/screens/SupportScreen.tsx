import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { navigateToDrawerScreen } from '../../../lib/auth/navigation';
import { SupportContactCard } from '../components/SupportContactCard';
import { supportBrand } from '../accountScreenBrands';
import { spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';

const TOPICS = [
  { icon: 'package-variant', label: 'Track medicine order delivery' },
  { icon: 'calendar-clock', label: 'Reschedule doctor appointment' },
  { icon: 'file-chart-outline', label: 'Download lab test report' },
  { icon: 'map-marker-outline', label: 'Update delivery address' },
  { icon: 'cash-refund', label: 'Payment & refund questions' },
] as const;

function SupportContent() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) + spacing.lg },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Icon name="lifebuoy" size={24} color={supportBrand.onAccent} />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.pageTitle}>Help desk</Text>
          <Text style={styles.subtitle}>
            Orders, bookings, prescriptions, and account help — 24/7.
          </Text>
        </View>
      </View>

      <SupportContactCard
        onHelpCenter={() => navigateToDrawerScreen(navigation, 'Help')}
      />

      <Text style={styles.sectionTitle}>Common topics</Text>
      <View style={styles.topics}>
        {TOPICS.map(topic => (
          <Pressable
            key={topic.label}
            style={({ pressed }) => [styles.topic, pressed && styles.topicPressed]}
            onPress={() => navigateToDrawerScreen(navigation, 'Help')}>
            <View style={styles.topicIcon}>
              <Icon name={topic.icon} size={18} color={supportBrand.accent} />
            </View>
            <Text style={styles.topicLabel}>{topic.label}</Text>
            <Icon name="chevron-right" size={18} color={supportBrand.mist} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

export function SupportScreen() {
  return (
    <ScreenLayout
      headerMode="stack"
      title="Support"
      showSearch={false}
      backgroundColor={supportBrand.page}>
      <SupportContent />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: supportBrand.accent,
    borderRadius: radius.xxl,
    padding: spacing.md,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1, minWidth: 0, gap: 4 },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: supportBrand.onAccent,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.85)',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: supportBrand.ink,
  },
  topics: { gap: spacing.sm },
  topic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: supportBrand.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: supportBrand.border,
    padding: spacing.md,
  },
  topicPressed: { backgroundColor: supportBrand.soft },
  topicIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: supportBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: supportBrand.ink,
  },
});
