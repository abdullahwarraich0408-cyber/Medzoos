import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { iosStackScreenOptions } from './iosStackOptions';
import { CommunityProvider } from '../lib/community/CommunityContext';
import { CommunityHomeScreen } from '../features/community/CommunityHomeScreen';
import { PostDetailScreen } from '../features/community/screens/PostDetailScreen';
import { CreatePostScreen } from '../features/community/screens/CreatePostScreen';
import { ChallengeDetailScreen } from '../features/community/screens/ChallengeDetailScreen';
import { GroupDetailScreen } from '../features/community/screens/GroupDetailScreen';
import { CreateGroupScreen } from '../features/community/screens/CreateGroupScreen';
import { CreateChallengeScreen } from '../features/community/screens/CreateChallengeScreen';
import { AddGroupMemberScreen } from '../features/community/screens/AddGroupMemberScreen';
import { BuddiesScreen } from '../features/community/screens/BuddiesScreen';
import { AddBuddyScreen } from '../features/community/screens/AddBuddyScreen';
import { WeeklyReportScreen } from '../features/community/screens/WeeklyReportScreen';
import type { CommunityStackParamList } from './types';

const Stack = createNativeStackNavigator<CommunityStackParamList>();

function CommunityStackNavigator() {
  return (
    <Stack.Navigator screenOptions={iosStackScreenOptions}>
      <Stack.Screen name="CommunityHome" component={CommunityHomeScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="CreateChallenge" component={CreateChallengeScreen} />
      <Stack.Screen name="AddGroupMember" component={AddGroupMemberScreen} />
      <Stack.Screen name="Buddies" component={BuddiesScreen} />
      <Stack.Screen name="AddBuddy" component={AddBuddyScreen} />
      <Stack.Screen name="WeeklyReport" component={WeeklyReportScreen} />
    </Stack.Navigator>
  );
}

export function CommunityStack() {
  return (
    <CommunityProvider>
      <CommunityStackNavigator />
    </CommunityProvider>
  );
}
