import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Pressable,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { SimpleMessage, SimpleSection } from '../../../design-system';
import { useCommunityContext } from '../../../lib/community/CommunityContext';
import { communityCopy } from '../../../lib/copy/uiMessages';
import type { CommunityStackParamList } from '../../../navigation/types';
import { colors, spacing, radius, TAB_BAR_CLEARANCE } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import { BuddyCard } from '../components/BuddyCard';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'Buddies'>;

export function BuddiesScreen() {
  const navigation = useNavigation<Nav>();
  const { buddies, sendEncouragement, removeBuddy, isAuthenticated } =
    useCommunityContext();

  return (
    <ScreenLayout
      title="Health buddies"
      headerMode="stack"
      showSearch={false}
      showCart={false}
      onBackPress={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.content}>
        <SimpleMessage
          message={
            isAuthenticated
              ? communityCopy.buddiesHint
              : 'Sign in to add buddies and cheer them on.'
          }
          tone="info"
        />

        <Pressable
          style={styles.addBuddyBtn}
          onPress={() => {
            if (!isAuthenticated) {
              Alert.alert('Sign in required', 'Sign in to add health buddies.');
              return;
            }
            navigation.navigate('AddBuddy');
          }}>
          <Icon name="account-plus-outline" size={22} color={colors.white} />
          <Text style={styles.addBuddyText}>Add health buddy</Text>
        </Pressable>

        <SimpleSection
          title="Your buddies"
          hint="Long-press a buddy to remove"
        />
        {buddies.length === 0 ? (
          <SimpleMessage message={communityCopy.noBuddiesYet} tone="default" />
        ) : (
          <View style={styles.list}>
            {buddies.map(b => (
              <Pressable
                key={b.id}
                onLongPress={() =>
                  Alert.alert(
                    'Remove buddy',
                    `Remove ${b.name} from your health buddies?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => removeBuddy(b.id),
                      },
                    ],
                  )
                }>
                <BuddyCard
                  buddy={b}
                  onEncourage={() => {
                    sendEncouragement(b.id);
                    Alert.alert('Sent!', `Encouragement sent to ${b.name}.`);
                  }}
                />
              </Pressable>
            ))}
          </View>
        )}

        <SimpleMessage message={communityCopy.buddiesLongPressHint} tone="default" />
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
  addBuddyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: healthOs.communityViolet,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
  },
  addBuddyText: { fontSize: 16, fontWeight: '700', color: colors.white },
  list: { gap: spacing.sm },
});
