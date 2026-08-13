import { Alert } from 'react-native';
import { navigateToPhoneSignIn } from '../../../lib/auth/navigation';

type NavLike = Parameters<typeof navigateToPhoneSignIn>[0];

/** Shared auth gate for community join / buddy actions. */
export function requireCommunityAuth(
  isAuthenticated: boolean,
  navigation: NavLike,
  message: string,
  action: () => void,
) {
  if (isAuthenticated) {
    action();
    return;
  }

  Alert.alert('Sign in required', message, [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Sign in',
      onPress: () => navigateToPhoneSignIn(navigation),
    },
  ]);
}

export function showJoinResult(
  result: { ok: boolean; reason?: string; needAuth?: boolean },
  navigation: NavLike,
  title: string,
) {
  if (result.needAuth) {
    Alert.alert('Sign in required', result.reason || 'Sign in to continue.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign in',
        onPress: () => navigateToPhoneSignIn(navigation),
      },
    ]);
    return;
  }
  if (!result.ok) {
    Alert.alert(title, result.reason || 'Something went wrong.');
    return;
  }
  if (result.reason) {
    Alert.alert(title, result.reason);
  }
}
