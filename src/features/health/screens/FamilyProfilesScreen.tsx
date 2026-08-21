import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { AppSheet } from '../../../components/modal/AppSheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { RequireAuthGate } from '../../auth/components/RequireAuthGate';
import { FamilySummaryCard } from '../components/family/FamilySummaryCard';
import { FamilyAlertCard } from '../components/family/FamilyAlertCard';
import { FamilyVaultTabs } from '../components/family/FamilyVaultTabs';
import { FamilyMemberRow } from '../components/family/FamilyMemberRow';
import { FamilyCalendarTab } from '../components/family/FamilyCalendarTab';
import { FamilyRecordsTab } from '../components/family/FamilyRecordsTab';
import {
  AddMemberModal,
  EMPTY_ADD_MEMBER_FORM,
  type AddMemberForm,
} from '../components/family/AddMemberModal';
import {
  useFamilyVault,
  useFamilyDashboard,
  useFamilyCalendar,
  useFamilyAiInsights,
  useCreateFamily,
  useAddFamilyMember,
} from '../../../lib/hooks/useApi';
import {
  buildFamilyVaultView,
  buildMemberViews,
  buildAlertsFromMembers,
  buildEventViews,
  buildRecentRecords,
  DEMO_MEMBERS,
  DEMO_ALERTS,
  type VaultTabId,
} from '../data/familyVaultModel';
import type { HealthStackParamList } from '../../../navigation/types';
import { colors, spacing, TAB_BAR_CLEARANCE, radius } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';

type HealthNav = NativeStackNavigationProp<HealthStackParamList>;

function FamilyProfilesContent() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HealthNav>();
  const [tab, setTab] = useState<VaultTabId>('members');
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState<AddMemberForm>(EMPTY_ADD_MEMBER_FORM);
  const [familyForm, setFamilyForm] = useState({
    name: '',
    home_address: '',
    emergency_contact: '',
    preferred_hospital: '',
    preferred_pharmacy: '',
    preferred_lab: '',
  });

  const { data: vault, isLoading, isError, refetch } = useFamilyVault();
  const { data: dashboard } = useFamilyDashboard({ enabled: Boolean(vault) });
  const { data: calendarEvents = [] } = useFamilyCalendar({
    enabled: Boolean(vault),
  });
  const { data: aiInsights } = useFamilyAiInsights({ enabled: Boolean(vault) });
  const createFamily = useCreateFamily();
  const addMember = useAddFamilyMember();

  const apiMembers =
    dashboard?.members ||
    vault?.members?.map(m => ({
      id: m.id,
      full_name: m.full_name,
      relationship: m.relationship,
      health_score: m.health_score ?? undefined,
      status_lines: [] as string[],
    })) ||
    [];

  const useDemo = apiMembers.length === 0 && Boolean(vault);

  const memberViews = useMemo(() => {
    if (apiMembers.length > 0 && vault) {
      return buildMemberViews(apiMembers, vault.id);
    }
    if (useDemo && vault) {
      return DEMO_MEMBERS.map(m => ({ ...m, familyId: vault.id }));
    }
    return [];
  }, [apiMembers, vault, useDemo]);

  const familyView = useMemo(() => {
    if (!vault) return null;
    const base = buildFamilyVaultView(vault, dashboard);
    const hasAlerts = memberViews.some(m => m.status !== 'all_good');
    return {
      ...base,
      memberCount: memberViews.length || base.memberCount,
      overallStatus: hasAlerts ? 'Some members need attention' : 'All good today',
    };
  }, [vault, dashboard, memberViews]);

  const alerts = useMemo(() => {
    const fromApi = buildAlertsFromMembers(memberViews, aiInsights?.members);
    if (fromApi.length > 0) return fromApi;
    return useDemo ? DEMO_ALERTS : [];
  }, [memberViews, aiInsights, useDemo]);

  const events = useMemo(() => {
    if (!vault) return [];
    return buildEventViews(calendarEvents, vault.id, useDemo);
  }, [calendarEvents, vault, useDemo]);

  const recentRecords = useMemo(() => {
    return buildRecentRecords(memberViews, useDemo);
  }, [memberViews, useDemo]);

  const handleCreateFamily = async () => {
    try {
      await createFamily.mutateAsync(familyForm);
      setShowCreateFamily(false);
      Alert.alert('Success', 'Family health vault created.');
    } catch (err) {
      Alert.alert(
        'Could not create family',
        err instanceof Error ? err.message : 'Please try again.',
      );
    }
  };

  const handleAddMember = async () => {
    if (!memberForm.full_name.trim()) {
      Alert.alert('Required', 'Please enter a full name.');
      return;
    }
    try {
      await addMember.mutateAsync({
        full_name: memberForm.full_name.trim(),
        relationship: memberForm.relationship,
        blood_group: memberForm.blood_group,
        gender: memberForm.gender || undefined,
        date_of_birth: memberForm.date_of_birth || undefined,
        phone: memberForm.phone || undefined,
      });
      setShowAddMember(false);
      setMemberForm(EMPTY_ADD_MEMBER_FORM);
      Alert.alert('Success', 'Family member added.');
    } catch (err) {
      Alert.alert(
        'Could not add member',
        err instanceof Error ? err.message : 'Please try again.',
      );
    }
  };

  const openMember = (memberId: string) => {
    if (memberId.startsWith('demo-')) {
      Alert.alert(
        'Demo member',
        'Connect the backend to open live member profiles.',
      );
      return;
    }
    navigation.navigate('FamilyMemberDetail', { memberId });
  };

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              Math.max(insets.bottom, TAB_BAR_CLEARANCE) + calmLayout.contentBottom,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary700}
            style={styles.loader}
          />
        ) : isError ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Could not load vault</Text>
            <Text style={styles.emptyText}>Please try again.</Text>
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={() => refetch()}>
              <Text style={styles.primaryBtnText}>Retry</Text>
            </Pressable>
          </View>
        ) : !vault || !familyView ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Icon
                name="account-group-outline"
                size={28}
                color={colors.primary700}
              />
            </View>
            <Text style={styles.emptyTitle}>Create your family</Text>
            <Text style={styles.emptyText}>
              Add members and keep everyone’s health in one place.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={() => setShowCreateFamily(true)}>
              <Text style={styles.primaryBtnText}>Create family</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <FamilySummaryCard
              family={familyView}
              onAddMember={() => setShowAddMember(true)}
            />

            <FamilyAlertCard
              alerts={alerts}
              onViewAll={() => setTab('members')}
            />

            <FamilyVaultTabs active={tab} onChange={setTab} />

            {tab === 'members' && (
              <View style={styles.section}>
                {memberViews.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>No members yet</Text>
                    <Text style={styles.emptyText}>
                      Add your first family member.
                    </Text>
                    <Pressable
                      style={({ pressed }) => [
                        styles.primaryBtn,
                        pressed && styles.btnPressed,
                      ]}
                      onPress={() => setShowAddMember(true)}>
                      <Text style={styles.primaryBtnText}>Add member</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.list}>
                    {memberViews.map(member => (
                      <FamilyMemberRow
                        key={member.memberId}
                        member={member}
                        onPress={() => openMember(member.memberId)}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {tab === 'calendar' && (
              <FamilyCalendarTab
                events={events}
                onAddEvent={() =>
                  Alert.alert('Add event', 'Event scheduling coming soon.')
                }
              />
            )}

            {tab === 'records' && (
              <FamilyRecordsTab
                recentRecords={recentRecords}
                members={memberViews}
                onMemberPress={openMember}
              />
            )}
          </>
        )}
      </ScrollView>

      <AppSheet visible={showCreateFamily} onClose={() => setShowCreateFamily(false)}>
        <Text style={styles.modalTitle}>Create family</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <FormField
            label="Family name (optional)"
            value={familyForm.name}
            onChangeText={v => setFamilyForm(f => ({ ...f, name: v }))}
          />
          <FormField
            label="Home address"
            value={familyForm.home_address}
            onChangeText={v => setFamilyForm(f => ({ ...f, home_address: v }))}
          />
          <FormField
            label="Emergency contact"
            value={familyForm.emergency_contact}
            onChangeText={v =>
              setFamilyForm(f => ({ ...f, emergency_contact: v }))
            }
          />
        </ScrollView>
        <View style={styles.modalActions}>
          <Pressable
            style={styles.cancelBtn}
            onPress={() => setShowCreateFamily(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={styles.saveBtn}
            onPress={handleCreateFamily}
            disabled={createFamily.isPending}>
            {createFamily.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveText}>Create</Text>
            )}
          </Pressable>
        </View>
      </AppSheet>

      <AddMemberModal
        visible={showAddMember}
        form={memberForm}
        onChange={setMemberForm}
        onClose={() => setShowAddMember(false)}
        onSave={handleAddMember}
        saving={addMember.isPending}
      />
    </>
  );
}

function FormField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textDisabled}
      />
    </View>
  );
}

export function FamilyProfilesScreen() {
  return (
    <ScreenLayout
      headerMode="stack"
      title="Family Vault"
      showSearch={false}
      showCart={false}>
      <RequireAuthGate
        title="Sign in to manage family"
        subtitle="View health profiles for you and your family."
        icon="account-group-outline">
        <FamilyProfilesContent />
      </RequireAuthGate>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    padding: calmLayout.screenPadding,
    gap: 20,
  },
  loader: { marginVertical: spacing.xxxl },
  section: { gap: spacing.sm },
  list: { gap: spacing.sm },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  primaryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.xl,
    backgroundColor: colors.primary700,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  btnPressed: { opacity: 0.9 },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  fieldWrap: { marginBottom: spacing.md },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  cancelText: { fontWeight: '600', color: colors.textMuted },
  saveBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.xl,
    backgroundColor: colors.primary700,
  },
  saveText: { fontWeight: '700', color: colors.white },
});
