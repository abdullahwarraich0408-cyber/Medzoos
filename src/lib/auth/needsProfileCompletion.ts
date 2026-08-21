const PLACEHOLDER_EMAIL = /@(firebase|dev)\.medzoos\.local$/i;

export function needsProfileCompletion(user?: {
  name?: string | null;
  email?: string | null;
} | null) {
  if (!user) return false;
  const name = String(user.name || '').trim();
  if (name.length >= 2) return false;
  const email = String(user.email || '').trim();
  return !email || PLACEHOLDER_EMAIL.test(email);
}

/** After sign-in, stay on auth until the profile is complete; home opens automatically. */
export function continueAfterAuth(
  navigation: { replace: (name: 'CompleteProfile') => void },
  user?: { name?: string | null; email?: string | null } | null,
) {
  if (needsProfileCompletion(user)) {
    navigation.replace('CompleteProfile');
  }
}
