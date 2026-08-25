import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { KeyboardAwareScrollView } from '../../../components/keyboard';
import { SimpleSection } from '../../../design-system';
import { useCommunityContext } from '../../../lib/community/CommunityContext';
import {
  HEALTH_GROUP_TEMPLATES,
  type GroupTemplate,
} from '../../../lib/community/groupConstants';
import type { CommunityStackParamList } from '../../../navigation/types';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'CreateGroup'>;

const ICONS = [
  'account-group',
  'heart-pulse',
  'brain',
  'food-apple',
  'baby-face',
  'water',
  'pill',
  'test-tube',
  'run',
];

export function CreateGroupScreen() {
  const navigation = useNavigation<Nav>();
  const { createGroup } = useCommunityContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [weeklyTopic, setWeeklyTopic] = useState('');
  const [icon, setIcon] = useState(ICONS[0]);
  const [submitting, setSubmitting] = useState(false);

  const applyTemplate = (template: GroupTemplate) => {
    setName(template.name);
    setDescription(template.description);
    setWeeklyTopic(template.weeklyTopic);
    setIcon(template.icon);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Give your group a name.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await createGroup({
        name: name.trim(),
        description: description.trim(),
        icon,
        weeklyTopic: weeklyTopic.trim() || undefined,
      });
      if (result.ok) {
        navigation.goBack();
      } else {
        Alert.alert('Could not create group', result.reason);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout title="Create health group" headerMode="stack" showSearch={false} showCart={false}>
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
        <SimpleSection
          title="Start from a template"
          hint="Pre-built groups for common health topics"
        />
        <View style={styles.templateList}>
          {HEALTH_GROUP_TEMPLATES.map(template => (
            <Pressable
              key={template.id}
              style={styles.templateCard}
              onPress={() => applyTemplate(template)}>
              <View style={styles.templateIcon}>
                <Icon name={template.icon} size={22} color={healthOs.communityViolet} />
              </View>
              <View style={styles.templateBody}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateFocus}>{template.focus}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.neutral400} />
            </Pressable>
          ))}
        </View>

        <SimpleSection title="Group details" hint="Customize name and purpose" />

        <Text style={styles.label}>Group name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Diabetes Support Pakistan"
          placeholderTextColor={colors.neutral500}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="What will members discuss here?"
          placeholderTextColor={colors.neutral500}
        />

        <Text style={styles.label}>Weekly debate topic</Text>
        <TextInput
          style={styles.input}
          value={weeklyTopic}
          onChangeText={setWeeklyTopic}
          placeholder="Rotating theme to spark discussions"
          placeholderTextColor={colors.neutral500}
        />

        <Text style={styles.label}>Icon</Text>
        <View style={styles.iconRow}>
          {ICONS.map(i => (
            <Pressable
              key={i}
              style={[styles.iconChip, icon === i && styles.iconChipActive]}
              onPress={() => setIcon(i)}>
              <Icon
                name={i}
                size={18}
                color={icon === i ? healthOs.communityViolet : colors.neutral500}
              />
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.btn, submitting && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}>
          <Text style={styles.btnText}>
            {submitting ? 'Creating...' : 'Create group'}
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
  templateList: { gap: spacing.sm, marginBottom: spacing.sm },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.md,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: healthOs.communitySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateBody: { flex: 1 },
  templateName: { fontSize: 14, fontWeight: '700', color: colors.ink900 },
  templateFocus: { fontSize: 11, color: colors.neutral500, marginTop: 2 },
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
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChipActive: {
    borderColor: healthOs.communityViolet,
    backgroundColor: healthOs.communitySurface,
  },
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
