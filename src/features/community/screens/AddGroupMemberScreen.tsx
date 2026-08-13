import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useCommunityContext } from '../../../lib/community/CommunityContext';
import type { CommunityStackParamList } from '../../../navigation/types';
import type { GroupMember } from '../../../lib/community/types';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';

type Route = RouteProp<CommunityStackParamList, 'AddGroupMember'>;
type Nav = NativeStackNavigationProp<CommunityStackParamList, 'AddGroupMember'>;

export function AddGroupMemberScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { searchUsers, addGroupMember, getGroup } = useCommunityContext();
  const group = getGroup(params.groupId);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; name: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const runSearch = useCallback(async () => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      setResults(await searchUsers(query.trim()));
    } finally {
      setSearching(false);
    }
  }, [query, searchUsers]);

  useEffect(() => {
    const timer = setTimeout(runSearch, 400);
    return () => clearTimeout(timer);
  }, [runSearch]);

  const handleAdd = async (userId: string, name: string) => {
    setAdding(userId);
    try {
      const ok = await addGroupMember(params.groupId, userId);
      if (ok) {
        Alert.alert('Member added', `${name} was added to the group.`);
        navigation.goBack();
      } else {
        Alert.alert('Failed', 'Could not add member. Check permissions.');
      }
    } finally {
      setAdding(null);
    }
  };

  return (
    <ScreenLayout
      title="Add member"
      headerMode="stack"
      showSearch={false}
      showCart={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>
          Search by name to add someone to {group?.name || 'this group'}.
        </Text>

        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search users..."
          placeholderTextColor={colors.neutral500}
          autoCapitalize="none"
        />

        {searching ? (
          <ActivityIndicator color={colors.brandPrimary} />
        ) : (
          <View style={styles.list}>
            {results.map(user => (
              <Pressable
                key={user.id}
                style={styles.row}
                onPress={() => handleAdd(user.id, user.name)}
                disabled={adding === user.id}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.add}>
                  {adding === user.id ? 'Adding...' : 'Add'}
                </Text>
              </Pressable>
            ))}
            {query.length >= 2 && results.length === 0 && !searching ? (
              <Text style={styles.empty}>No users found.</Text>
            ) : null}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE + spacing.lg,
    gap: spacing.md,
  },
  hint: { ...healthOsTypography.messageBody, color: colors.neutral600 },
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
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
  },
  name: { fontSize: 15, fontWeight: '600', color: colors.ink900 },
  add: { fontSize: 13, fontWeight: '700', color: colors.brandPrimary },
  empty: { textAlign: 'center', color: colors.neutral500, paddingVertical: spacing.lg },
});
