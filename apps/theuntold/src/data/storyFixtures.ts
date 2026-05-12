/**
 * Local fixtures for TheUntold. The CoreBackend does not yet expose Stories /
 * Streaks / Featured endpoints; this module gives the UI a stable seam.
 * Replace `*Fixtures` exports with real API calls (same shapes) when the
 * backend extends — no component changes will be required.
 */
import type {
  AppNotification,
  Author,
  DailyPrompt,
  FamilyMember,
  Milestone,
  ProfileStats,
  Story,
  Streak,
  TimeCapsule,
} from '../types/contracts';

const authorMaya: Author = {
  id: 'a-maya',
  name: 'Maya Iyer',
  avatarUrl: null,
  initials: 'MI',
};
const authorTom: Author = {
  id: 'a-tom',
  name: 'Thomas Whitfield',
  avatarUrl: null,
  initials: 'TW',
};
const authorRani: Author = {
  id: 'a-rani',
  name: 'Rani Aluri',
  avatarUrl: null,
  initials: 'RA',
};
const authorYou: Author = {
  id: 'a-you',
  name: 'You',
  avatarUrl: null,
  initials: 'Yo',
};

function isoDaysAgo(days: number, hour = 8): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 12, 0, 0);
  return d.toISOString();
}

export const fallbackPrompt: DailyPrompt = {
  key: 'fallback',
  question:
    'Write about a smell from your childhood that still finds you sometimes — and where it takes you.',
  helper: 'There is no wrong way to tell it.',
  dateLabel: new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }),
};

export const featuredStory: Story = {
  id: 's-featured-1',
  author: authorMaya,
  title: 'The hour my grandmother sang to no one',
  excerpt:
    'On Sundays she opened the window before the kettle. The neighbours never said anything. They listened.',
  body: `On Sundays she opened the window before the kettle. She said the air needed to be invited in, that it was rude to make it knock. Then she sang — not for us, not for the neighbours, not for anyone in the room. She sang to no one.

I asked her once why she did it. She held my chin and said, "Because someone will need to remember the tune."

I did not understand that for thirty years.

I understand it now.`,
  kind: 'text',
  audioUrl: null,
  durationSeconds: null,
  wordCount: 96,
  tags: ['family', 'childhood', 'memory'],
  createdAt: isoDaysAgo(0, 6),
  promptKey: 'fallback',
  isFeatured: true,
  heartCount: 248,
  visibility: 'community',
};

export const recentStoriesFixtures: Story[] = [
  {
    id: 's-rec-1',
    author: authorTom,
    title: 'The map my father drew on a napkin',
    excerpt:
      'He had never been to the city we were going to. He drew it anyway. He was that kind of man.',
    body: 'He had never been to the city we were going to. He drew it anyway, in blue pen, on a napkin from the diner. He was that kind of man.',
    kind: 'text',
    audioUrl: null,
    durationSeconds: null,
    wordCount: 32,
    tags: ['family', 'love'],
    createdAt: isoDaysAgo(1),
    promptKey: null,
    isFeatured: false,
    heartCount: 41,
    visibility: 'community',
  },
  {
    id: 's-rec-2',
    author: authorRani,
    title: 'My first real apology',
    excerpt:
      'I was twenty-three. She was eighty-one. I had been wrong for nine years and had not known it.',
    body: 'I was twenty-three. She was eighty-one. I had been wrong for nine years and had not known it. I learned that apologies are heavier when they are late.',
    kind: 'text',
    audioUrl: null,
    durationSeconds: null,
    wordCount: 34,
    tags: ['regret', 'lesson'],
    createdAt: isoDaysAgo(2),
    promptKey: null,
    isFeatured: false,
    heartCount: 96,
    visibility: 'community',
  },
  {
    id: 's-rec-3',
    author: authorMaya,
    title: 'A song that does not exist anymore',
    excerpt:
      'My mother hummed it through every winter. I have asked everyone. No one knows what it was.',
    body: 'My mother hummed it through every winter. I have asked everyone. No one knows what it was. I have started humming it for my daughter.',
    kind: 'voice',
    audioUrl: null,
    durationSeconds: 124,
    wordCount: 0,
    tags: ['family', 'childhood'],
    createdAt: isoDaysAgo(3),
    promptKey: null,
    isFeatured: false,
    heartCount: 58,
    visibility: 'community',
  },
  {
    id: 's-rec-4',
    author: authorTom,
    title: 'The yellow door',
    excerpt: 'The yellow door was not ours, but the cat thought it was.',
    body: 'The yellow door was not ours, but the cat thought it was, and so for fourteen summers it was.',
    kind: 'text',
    audioUrl: null,
    durationSeconds: null,
    wordCount: 19,
    tags: ['joy', 'childhood'],
    createdAt: isoDaysAgo(4),
    promptKey: null,
    isFeatured: false,
    heartCount: 22,
    visibility: 'community',
  },
];

export const myStoriesFixtures: Story[] = [
  {
    id: 's-mine-1',
    author: authorYou,
    title: 'The bicycle bell on Tuesdays',
    excerpt:
      'Every Tuesday after school my grandfather rang the bicycle bell three times at the gate.',
    body: `Every Tuesday after school my grandfather rang the bicycle bell three times at the gate. Three was the secret. Two and we knew he had bread. Three and we knew he had a story.

I never asked what he did on the other days. I think now that he did the same thing — only without us.`,
    kind: 'text',
    audioUrl: null,
    durationSeconds: null,
    wordCount: 64,
    tags: ['family', 'childhood'],
    createdAt: isoDaysAgo(0, 19),
    promptKey: 'fallback',
    isFeatured: false,
    heartCount: 0,
    visibility: 'private',
  },
  {
    id: 's-mine-2',
    author: authorYou,
    title: 'A small thing I never said',
    excerpt: 'It was small. It mattered. I never said it. I am saying it now.',
    body: 'It was small. It mattered. I never said it. I am saying it now. Thank you. For all of it. For the part you did not know I noticed.',
    kind: 'voice',
    audioUrl: null,
    durationSeconds: 78,
    wordCount: 0,
    tags: ['love', 'regret'],
    createdAt: isoDaysAgo(4, 21),
    promptKey: null,
    isFeatured: false,
    heartCount: 0,
    visibility: 'family',
  },
  {
    id: 's-mine-3',
    author: authorYou,
    title: 'The day the river froze',
    excerpt:
      'My brother walked out onto it. My mother did not call. She held my hand so tightly my fingers went white.',
    body: 'My brother walked out onto it. My mother did not call. She held my hand so tightly my fingers went white. I was eight. He was eleven. The river did not crack.',
    kind: 'text',
    audioUrl: null,
    durationSeconds: null,
    wordCount: 38,
    tags: ['family', 'childhood'],
    createdAt: isoDaysAgo(11),
    promptKey: null,
    isFeatured: false,
    heartCount: 0,
    visibility: 'private',
  },
];

export const featuredFeedFixtures: Story[] = [featuredStory, ...recentStoriesFixtures];

export const streakFixture: Streak = {
  currentDays: 7,
  longestDays: 12,
  weekProgress: [true, true, true, false, true, true, true],
  lastEntryAt: isoDaysAgo(0, 19),
};

export const profileStatsFixture: ProfileStats = {
  totalStories: 24,
  daysActive: 41,
  wordsWritten: 8920,
  featuredCount: 1,
};

export const milestonesFixture: Milestone[] = [
  {
    key: 'first-story',
    label: 'Wrote your first story',
    achievedAt: isoDaysAgo(41, 9),
    icon: 'pen-line',
    highlight: false,
  },
  {
    key: 'streak-7',
    label: '7-day streak achieved',
    achievedAt: isoDaysAgo(0, 19),
    icon: 'flame',
    highlight: true,
  },
  {
    key: 'featured',
    label: 'A story was featured',
    achievedAt: null,
    icon: 'sparkles',
    highlight: false,
  },
  {
    key: 'voice-first',
    label: 'Recorded a voice story',
    achievedAt: isoDaysAgo(4, 21),
    icon: 'mic',
    highlight: false,
  },
];

export const familyMembersFixture: FamilyMember[] = [
  { id: 'fm-1', name: 'Anika (daughter)', email: 'anika@example.com', status: 'active',  avatarUrl: null },
  { id: 'fm-2', name: 'Sam (son)',        email: 'sam@example.com',   status: 'invited', avatarUrl: null },
];

export const timeCapsulesFixture: TimeCapsule[] = [
  {
    id: 'tc-1',
    title: 'For Anika, on her 21st',
    unlocksOn: new Date(new Date().setFullYear(new Date().getFullYear() + 4)).toISOString(),
    storyIds: ['s-mine-1', 's-mine-3'],
  },
];

export const notificationsFixture: AppNotification[] = [
  {
    id: 'n-1',
    kind: 'daily-prompt',
    title: "Today's prompt is waiting",
    body: 'A new prompt is on the table. Five minutes is enough.',
    createdAt: isoDaysAgo(0, 8),
    read: false,
  },
  {
    id: 'n-2',
    kind: 'story-featured',
    title: 'Your story was featured',
    body: '"The bicycle bell on Tuesdays" is on the community page today.',
    createdAt: isoDaysAgo(2, 11),
    read: false,
  },
  {
    id: 'n-3',
    kind: 'story-loved',
    title: '12 people held this story close',
    body: '"A small thing I never said" — strangers paused for it.',
    createdAt: isoDaysAgo(3, 17),
    read: true,
  },
  {
    id: 'n-4',
    kind: 'family-shared',
    title: 'Anika added a story',
    body: 'A new entry in your shared vault.',
    createdAt: isoDaysAgo(5, 10),
    read: true,
  },
];

export function getStoryById(id: string): Story | null {
  return (
    [featuredStory, ...recentStoriesFixtures, ...myStoriesFixtures].find(
      (s) => s.id === id,
    ) ?? null
  );
}
