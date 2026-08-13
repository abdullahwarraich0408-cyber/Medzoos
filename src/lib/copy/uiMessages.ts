/** Plain-language UI copy — short, clear, one idea per line */

export const homeCopy = {
  pageHint: 'Here is what matters for your health today.',
  aiLabel: 'Your health update',
  aiCta: 'Talk to Copilot',
  attentionTitle: 'Needs your attention',
  attentionHint: 'Tap any item to take action.',
  allCaughtUp: 'You are all caught up. Nothing needs action right now.',
  careTitle: 'Get care',
  careHint: 'Book doctors, order medicine, or schedule a lab test.',
  tasksTitle: 'Today’s tasks',
  tasksHint: 'Small steps that keep you on track.',
  emergency: 'Emergency — get help now',
  emptyTimeline: 'No recent activity yet. Your visits and orders will show here.',
  medicinesDue: '2 medicines due today',
  medicinesClear: 'Medicines are on track',
  appointmentsNone: 'No upcoming appointments',
  appointmentsCount: (n: number) =>
    n === 1 ? '1 appointment coming up' : `${n} appointments coming up`,
  labsNew: (n: number) =>
    n === 1 ? '1 new lab report ready' : `${n} new lab reports ready`,
  labsClear: 'All lab reports are up to date',
};

export const copilotCopy = {
  title: 'Health Copilot',
  welcome:
    'Tell me how you feel or what you need. I will ask simple follow-up questions and suggest your next step.',
  inputPlaceholder: 'Example: I have fever since last night',
  tryLabel: 'Quick examples',
  safetyNote:
    'This is not emergency care. For chest pain, trouble breathing, or severe bleeding — call 1122 immediately.',
  youLabel: 'You',
  copilotLabel: 'Copilot',
};

export const healthCopy = {
  title: 'Your health records',
  pageHint: 'All your reports, visits, and medicines in one place.',
  insightLabel: 'Today’s note',
};

export const communityCopy = {
  title: 'Community',
  pageHint: 'Share updates, join support groups, and take on health challenges together.',
  feedTitle: 'Health feed',
  feedHint: 'Stories from patients and tips from verified doctors',
  feedSafety:
    'Tips from verified doctors appear first. Always confirm medical advice with your own doctor.',
  emptyFeed: 'No posts in this filter yet. Try another filter or create a post.',
  groupsTitle: 'Support groups',
  groupsHint: 'Join people with similar conditions or goals',
  challengesTitle: 'Health challenges',
  challengesHint: 'Build habits, track progress, and earn rewards',
  activityTitle: 'My activity',
  activityHint: 'Buddies, your posts, groups, and weekly progress',
  createPostHint:
    'Share helpful experiences or ask questions. Unsafe medical advice is blocked.',
  anonymousTitle: 'Post anonymously',
  anonymousHint: 'Your name stays hidden. Useful for sensitive topics.',
  moderationNote:
    'Posts are checked before publishing. Misinformation and harmful advice are removed.',
  postPublished: 'Your post is live. Thank you for contributing.',
  postBlocked: 'Your post could not be published. Please review and try again.',
  buddiesHint:
    'Health buddies keep you accountable. Cheer each other on and join challenges together.',
  addBuddyHint:
    'Add people you meet in groups or challenges. You can cheer them on and see their progress.',
  findBuddyHint: 'Three easy ways to connect',
  findBuddySteps: [
    'Join a support group and add members you recognize.',
    'Join the same challenge and add people from the leaderboard.',
    'Use Suggested people below — they are already in your groups or challenges.',
  ],
  noBuddySuggestions:
    'No new suggestions right now. Join a group or challenge to discover more people.',
  inviteBuddyHint:
    'Invite friends by phone or link — coming soon. For now, add people from groups and challenges.',
  noBuddiesYet: 'You have no buddies yet. Tap "Add health buddy" to get started.',
  buddiesLongPressHint: 'Tip: Long-press a buddy to remove them from your list.',
  shareReport: 'Share report card',
};

export const youCopy = {
  title: 'Your profile',
  pageHint: 'Account settings, orders, and your health progress.',
  guestTitle: 'Sign in to your account',
  guestMessage: 'Save your orders, health records, and preferences in one place.',
};

export const servicesCopy = {
  title: 'Healthcare services',
  pageHint: 'Choose what you need. We will guide you through booking.',
  pharmacyTitle: 'Order medicines',
  pharmacyMessage: 'Browse pharmacy products and get delivery.',
};
