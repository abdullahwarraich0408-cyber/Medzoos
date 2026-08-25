import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { KeyboardAwareScrollView } from '../../../components/keyboard';
import { CollapsibleSection, SimpleMessage } from '../../../design-system';
import { useCommunityContext } from '../../../lib/community/CommunityContext';
import { BUDDY_RELATIONS } from '../../../lib/community/mockData';
import { communityCopy } from '../../../lib/copy/uiMessages';
import type { HealthBuddy } from '../../../lib/community/types';
import type { CommunityStackParamList } from '../../../navigation/types';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'AddBuddy'>;

export function AddBuddyScreen() {
  const navigation = useNavigation<Nav>();
  const { suggestedBuddies, addBuddy, isAuthenticated } = useCommunityContext();
  const [search, setSearch] = useState('');
  const [selectedRelation, setSelectedRelation] = useState<HealthBuddy['relation']>('friend');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return suggestedBuddies;
    return suggestedBuddies.filter(
      s => s.name.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q),
    );
  }, [search, suggestedBuddies]);

  const handleAdd = async (suggestionId: string, name: string) => {
    const suggestion = suggestedBuddies.find(s => s.id === suggestionId);
    if (!suggestion) return;

    setPendingId(suggestionId);
    const result = await addBuddy(suggestion, selectedRelation);
    setPendingId(null);

    if (result.needAuth) {
      Alert.alert('Sign in required', result.reason || 'Sign in to add buddies.', [
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    if (!result.ok) {
      Alert.alert('Buddy', result.reason || 'Could not add buddy.');
      return;
    }

    Alert.alert('Buddy added', result.reason || `${name} is now your health buddy.`, [
      { text: 'Add another' },
      { text: 'Done', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScreenLayout
      title="Add health buddy"
      headerMode="stack"
      showSearch={false}
      showCart={false}
      onBackPress={() => navigation.goBack()}>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        <SimpleMessage
          message={
            isAuthenticated
              ? 'Add people you meet in groups or challenges. Pick how you know them, then tap Add.'
              : 'Sign in to add health buddies from groups and challenges.'
          }
          tone="info"
        />

        <View style={styles.relations}>
          {BUDDY_RELATIONS.map(r => (
            <Pressable
              key={r.id}
              style={[styles.relationChip, selectedRelation === r.id && styles.relationActive]}
              onPress={() => setSelectedRelation(r.id)}>
              <Text
                style={[
                  styles.relationText,
                  selectedRelation === r.id && styles.relationTextActive,
                ]}>
                {r.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.search}
          placeholder="Search by name..."
          placeholderTextColor={colors.neutral500}
          value={search}
          onChangeText={setSearch}
        />

        {filtered.length === 0 ? (
          <SimpleMessage message={communityCopy.noBuddySuggestions} tone="default" />
        ) : (
          <View style={styles.list}>
            {filtered.map(s => (
              <View key={s.id} style={styles.suggestion}>
                <View style={styles.suggestionBody}>
                  <Text style={styles.name}>{s.name}</Text>
                  <Text style={styles.sub}>{s.subtitle}</Text>
                  <Text style={styles.source}>
                    From {s.source === 'group' ? 'a group' : s.source === 'challenge' ? 'a challenge' : 'community'}
                  </Text>
                </View>
                <Pressable
                  style={styles.addBtn}
                  onPress={() => handleAdd(s.id, s.name)}
                  disabled={pendingId === s.id}>
                  <Icon name="account-plus" size={18} color={colors.white} />
                  <Text style={styles.addText}>
                    {pendingId === s.id ? '...' : 'Add'}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <CollapsibleSection title="How to find people">
          {communityCopy.findBuddySteps.map((step, i) => (
            <Text key={i} style={styles.stepText}>
              {i + 1}. {step}
            </Text>
          ))}
        </CollapsibleSection>
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: calmLayout.screenPadding,
    paddingBottom: TAB_BAR_CLEARANCE + calmLayout.contentBottom,
    gap: calmLayout.sectionGap,
  },
  relations: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  relationChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    backgroundColor: colors.surfaceBase,
  },
  relationActive: {
    backgroundColor: healthOs.communityViolet,
    borderColor: healthOs.communityViolet,
  },
  relationText: { fontSize: 13, fontWeight: '600', color: colors.neutral600 },
  relationTextActive: { color: colors.white },
  search: {
    backgroundColor: colors.surfaceBase,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.ink900,
  },
  list: { gap: calmLayout.blockGap },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceBase,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
  },
  suggestionBody: { flex: 1, gap: 2 },
  name: healthOsTypography.messageTitle,
  sub: healthOsTypography.messageCaption,
  source: { fontSize: 11, color: colors.primary700, fontWeight: '600', marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: healthOs.communityViolet,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  addText: { fontSize: 13, fontWeight: '700', color: colors.white },
  stepText: { ...healthOsTypography.messageBody, marginBottom: spacing.sm },
});
