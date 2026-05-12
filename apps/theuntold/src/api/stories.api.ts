/**
 * Stub stories API. Backed by `data/storyFixtures.ts` today.
 * When CoreBackend exposes Stories endpoints, replace these implementations
 * — the call sites in hooks/pages do not need to change.
 */
import {
  familyMembersFixture,
  featuredFeedFixtures,
  featuredStory,
  getStoryById,
  milestonesFixture,
  myStoriesFixtures,
  notificationsFixture,
  profileStatsFixture,
  recentStoriesFixtures,
  streakFixture,
  timeCapsulesFixture,
} from '../data/storyFixtures';
import type {
  AppNotification,
  FamilyMember,
  Milestone,
  ProfileStats,
  Story,
  Streak,
  TimeCapsule,
} from '../types/contracts';

function delayed<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function fetchFeaturedStory(): Promise<Story> {
  return delayed(featuredStory);
}

export async function fetchRecentStories(): Promise<Story[]> {
  return delayed(recentStoriesFixtures);
}

export async function fetchMyStories(): Promise<Story[]> {
  return delayed(myStoriesFixtures);
}

export async function fetchFeaturedFeed(): Promise<Story[]> {
  return delayed(featuredFeedFixtures);
}

export async function fetchStoryById(id: string): Promise<Story | null> {
  return delayed(getStoryById(id));
}

export async function fetchStreak(): Promise<Streak> {
  return delayed(streakFixture);
}

export async function fetchProfileStats(): Promise<ProfileStats> {
  return delayed(profileStatsFixture);
}

export async function fetchMilestones(): Promise<Milestone[]> {
  return delayed(milestonesFixture);
}

export async function fetchFamilyMembers(): Promise<FamilyMember[]> {
  return delayed(familyMembersFixture);
}

export async function fetchTimeCapsules(): Promise<TimeCapsule[]> {
  return delayed(timeCapsulesFixture);
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  return delayed(notificationsFixture);
}
