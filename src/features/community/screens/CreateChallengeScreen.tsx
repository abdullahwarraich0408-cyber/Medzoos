import React, { useState } from 'react';
import {
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { KeyboardAwareScrollView } from '../../../components/keyboard';
import { useCommunityContext } from '../../../lib/community/CommunityContext';
import type { CommunityStackParamList } from '../../../navigation/types';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'CreateChallenge'>;

const UNITS = ['steps', 'glasses', 'days', 'minutes', 'sessions'];

export function CreateChallengeScreen() {
  const navigation = useNavigation<Nav>();
  const { createChallenge } = useCommunityContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('10000');
  const [unit, setUnit] = useState('steps');
  const [durationDays, setDurationDays] = useState('7');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Name your challenge.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await createChallenge({
        title: title.trim(),
        description: description.trim(),
        target: parseInt(target, 10) || 100,
        unit,
        durationDays: parseInt(durationDays, 10) || 7,
        color: healthOs.communityViolet,
        icon: 'trophy',
      });
      if (result.ok) {
        navigation.goBack();
      } else {
        Alert.alert('Could not create challenge', result.reason);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout title="Create challenge" headerMode="stack" showSearch={false} showCart={false}>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Challenge title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Walk 10K Steps"
          placeholderTextColor={colors.neutral500}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Motivate your community..."
          placeholderTextColor={colors.neutral500}
        />

        <Text style={styles.label}>Target</Text>
        <TextInput
          style={styles.input}
          value={target}
          onChangeText={setTarget}
          keyboardType="number-pad"
          placeholder="10000"
          placeholderTextColor={colors.neutral500}
        />

        <Text style={styles.label}>Unit</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitRow}>
          {UNITS.map(u => (
            <Pressable
              key={u}
              style={[styles.unitChip, unit === u && styles.unitChipActive]}
              onPress={() => setUnit(u)}>
              <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>{u}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.label}>Duration (days)</Text>
        <TextInput
          style={styles.input}
          value={durationDays}
          onChangeText={setDurationDays}
          keyboardType="number-pad"
          placeholder="7"
          placeholderTextColor={colors.neutral500}
        />

        <Pressable
          style={[styles.btn, submitting && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}>
          <Text style={styles.btnText}>
            {submitting ? 'Creating...' : 'Launch challenge'}
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE + spacing.lg,
    gap: spacing.md,
  },
  label: { ...healthOsTypography.messageTitle, fontSize: 14 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.ink900,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  unitRow: { gap: spacing.sm },
  unitChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    backgroundColor: colors.white,
  },
  unitChipActive: {
    borderColor: healthOs.communityViolet,
    backgroundColor: healthOs.communitySurface,
  },
  unitText: { fontSize: 12, fontWeight: '600', color: colors.neutral600 },
  unitTextActive: { color: healthOs.communityViolet },
  btn: {
    marginTop: spacing.md,
    backgroundColor: healthOs.communityViolet,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
