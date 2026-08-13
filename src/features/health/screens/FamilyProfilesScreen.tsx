import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
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
import { FamilyActivitySection } from '../components/family/FamilyActivitySection';
import {
  AddMemberModal,
  EMPTY_ADD_MEMBER_FORM,
  type AddMemberForm,
} from '../components/family/AddMemberModal';
import { PrimaryAction } from '../../../design-system';
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
  buildActivityFromAlerts,
  DEMO_MEMBERS,
  DEMO_ALERTS,
  DEMO_ACTIVITY,
  type VaultTabId,
} from '../data/familyVaultModel';
import type { HealthStackParamList } from '../../../navigation/types';
import { colors, spacing, TAB_BAR_CLEARANCE, radius, cardStyles } from '../../../theme';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';
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
  const { data: calendarEvents = [] } = useFamilyCalendar({ enabled: Boolean(vault) });
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

  const activity = useMemo(() => {
    const fromAlerts = buildActivityFromAlerts(alerts);
    if (fromAlerts.length > 0) return fromAlerts;
    return useDemo ? DEMO_ACTIVITY : [];
  }, [alerts, useDemo]);

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
      Alert.alert('Demo member', 'Connect the backend to open live member profiles.');
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
          { paddingBottom: Math.max(insets.bottom, TAB_BAR_CLEARANCE) + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Manage your family health in one secure place.
        </Text>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.brandPrimary}
            style={styles.loader}
          />
        ) : isError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Could not load family vault</Text>
            <Text style={styles.errorText}>Please try again.</Text>
            <PrimaryAction icon="refresh" title="Retry" onPress={() => refetch()} />
          </View>
        ) : !vault || !familyView ? (
          <View style={styles.emptyCard}>
            <Icon name="account-group-outline" size={48} color={colors.brandPrimary} />
            <Text style={styles.emptyTitle}>Create your family</Text>
            <Text style={styles.emptyText}>
              Set up your family health vault to add members and track care.
            </Text>
            <PrimaryAction
              icon="plus-circle-outline"
              title="Create Family"
              onPress={() => setShowCreateFamily(true)}
            />
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
                <Text style={styles.sectionTitle}>Family members</Text>
                {memberViews.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>No members yet</Text>
                    <Text style={styles.emptyText}>
                      Add your first family member to start tracking health.
                    </Text>
                    <PrimaryAction
                      icon="account-plus-outline"
                      title="Add member"
                      onPress={() => setShowAddMember(true)}
                    />
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
                <FamilyActivitySection items={activity} />
              </View>
            )}

            {tab === 'calendar' && (
              <FamilyCalendarTab
                events={events}
                onAddEvent={() => Alert.alert('Add event', 'Event scheduling coming soon.')}
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
        <Text style={styles.modalTitle}>Create Family</Text>
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
            onChangeText={v => setFamilyForm(f => ({ ...f, emergency_contact: v }))}
          />
        </ScrollView>
        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setShowCreateFamily(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleCreateFamily}
            disabled={createFamily.isPending}>
            {createFamily.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveText}>Create Family</Text>
            )}
          </TouchableOpacity>
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
        placeholderTextColor={colors.neutral300}
      />
    </View>
  );
}

export function FamilyProfilesScreen() {
  return (
    <ScreenLayout
      headerMode="stack"
      title="Family Health Vault"
      showSearch={false}
      showCart>
      <RequireAuthGate
        title="Sign in to manage family"
        subtitle="View health profiles for yourself and family members."
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
    gap: calmLayout.sectionGap,
  },
  subtitle: {
    ...healthOsTypography.sectionHint,
    fontSize: 14,
    lineHeight: 21,
    marginTop: -spacing.sm,
  },
  loader: { marginVertical: spacing.xxxl },
  section: { gap: spacing.sm },
  sectionTitle: {
    ...healthOsTypography.sectionTitle,
    fontSize: 15,
  },
  list: { gap: spacing.sm },
  emptyCard: {
    ...cardStyles.premiumSoft,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginTop: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.neutral500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  errorCard: {
    ...cardStyles.premiumSoft,
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorTitle: { fontSize: 16, fontWeight: '700', color: colors.inkHeadline },
  errorText: { fontSize: 14, color: colors.neutral500, lineHeight: 20 },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.lg,
  },
  fieldWrap: { marginBottom: spacing.md },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral600,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.ink900,
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
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
  },
  cancelText: { fontWeight: '600', color: colors.neutral600 },
  saveBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.brandPrimary,
  },
  saveText: { fontWeight: '700', color: colors.white },
});
