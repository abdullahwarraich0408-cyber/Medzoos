import type { ModerationResult } from './types';

const BLOCKED_PATTERNS = [
  /cure\s+cancer/i,
  /stop\s+taking\s+(your\s+)?medicine/i,
  /miracle\s+treatment/i,
  /guaranteed\s+cure/i,
  /buy\s+medicine\s+without\s+prescription/i,
  /fake\s+vaccine/i,
];

const WARNING_PATTERNS = [
  /take\s+\d+\s+pills/i,
  /self.?medicate/i,
  /ignore\s+doctor/i,
];

export function moderatePostContent(content: string): ModerationResult {
  const trimmed = content.trim();

  if (trimmed.length < 10) {
    return {
      approved: false,
      reason: 'Please write at least 10 characters so others can understand your post.',
    };
  }

  if (trimmed.length > 2000) {
    return {
      approved: false,
      reason: 'Post is too long. Please keep it under 2000 characters.',
    };
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        approved: false,
        reason:
          'This post may contain unsafe medical advice. It was not published. Please consult a verified doctor.',
      };
    }
  }

  for (const pattern of WARNING_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        approved: false,
        reason:
          'Posts about changing medication must come from verified professionals. Please rephrase or ask a doctor.',
      };
    }
  }

  return { approved: true };
}
