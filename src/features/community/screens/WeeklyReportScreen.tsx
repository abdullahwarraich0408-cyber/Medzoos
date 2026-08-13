import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { SimpleSection } from '../../../design-system';
import { useCommunityContext } from '../../../lib/community/CommunityContext';
import { communityCopy } from '../../../lib/copy/uiMessages';
import type { CommunityStackParamList } from '../../../navigation/types';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';
import { WeeklyReportCard } from '../components/WeeklyReportCard';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'WeeklyReport'>;

export function WeeklyReportScreen() {
  const navigation = useNavigation<Nav>();
  const { weeklyReport, profile } = useCommunityContext();

  const shareCard = async () => {
    const message = [
      `My medCare Health Report (${weeklyReport.weekLabel})`,
      `Health score change: +${weeklyReport.healthScoreChange}`,
      `Medicine adherence: ${weeklyReport.medicineAdherence}%`,
      `Steps: ${weeklyReport.stepsTotal.toLocaleString()}`,
      weeklyReport.streakSummary,
      weeklyReport.aiRecommendation,
    ].join('\n');

    try {
      await Share.share({ message });
    } catch {
      Alert.alert('Share', message);
    }
  };

  return (
    <ScreenLayout
      title="Weekly report"
      headerMode="stack"
      showSearch={false}
      showCart={false}
      onBackPress={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.brand}>medCare</Text>
          <Text style={styles.user}>{profile.displayName}'s health week</Text>
          <WeeklyReportCard report={weeklyReport} />
        </View>

        <SimpleSection title="Share your progress" hint="WhatsApp, Instagram, or Facebook" />
        <Pressable style={styles.shareBtn} onPress={shareCard}>
          <Icon name="share-variant" size={20} color={colors.white} />
          <Text style={styles.shareText}>{communityCopy.shareReport}</Text>
        </Pressable>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE + spacing.lg,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surfaceBase,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
    gap: spacing.md,
  },
  brand: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brandPrimary,
    letterSpacing: 1,
  },
  user: { ...healthOsTypography.messageTitle, fontSize: 18 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: healthOs.communityViolet,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
  },
  shareText: { fontSize: 15, fontWeight: '700', color: colors.white },
});
