/**
 * Stories API — real CoreBackend endpoints.
 * (Previously fixture-backed; the fetch* signatures are unchanged so pages
 * and hooks did not need to change.)
 */
import { apiClient, buildAbsoluteUrl } from './client';
import type {
  AppNotification,
  BillingPlan,
  BillingStatus,
  CheckoutSession,
  CreateStoryInput,
  CreatedStory,
  FamilyMember,
  HeartResult,
  Milestone,
  ProfileStats,
  Story,
  StoryStatus,
  Streak,
  TimeCapsule,
  VaultInvite,
} from '../types/contracts';

const PRODUCT_SLUG = import.meta.env.VITE_PRODUCT_SLUG ?? 'theuntold';

function normalizeStory(story: Story): Story {
  return { ...story, audioUrl: buildAbsoluteUrl(story.audioUrl) };
}

// ── Reads (signatures preserved from the fixture era) ───────────────────────

export async function fetchFeaturedStory(): Promise<Story | null> {
  try {
    const { data } = await apiClient.get<Story>('/feed/story-of-the-day', {
      params: { productSlug: PRODUCT_SLUG },
    });
    return normalizeStory(data);
  } catch {
    return null; // no community story yet — pages render their empty states
  }
}

export async function fetchRecentStories(): Promise<Story[]> {
  const { data } = await apiClient.get<{ stories: Story[] }>('/feed/featured', {
    params: { productSlug: PRODUCT_SLUG, page: 1, pageSize: 8 },
  });
  return data.stories.map(normalizeStory);
}

export async function fetchMyStories(): Promise<Story[]> {
  const { data } = await apiClient.get<Story[]>('/stories/mine');
  return data.map(normalizeStory);
}

export async function fetchFeaturedFeed(): Promise<Story[]> {
  const { data } = await apiClient.get<{ stories: Story[] }>('/feed/featured', {
    params: { productSlug: PRODUCT_SLUG, page: 1, pageSize: 30 },
  });
  return data.stories.map(normalizeStory);
}

export async function fetchStoryById(id: string): Promise<Story | null> {
  try {
    const { data } = await apiClient.get<Story>(`/stories/${id}`);
    return normalizeStory(data);
  } catch {
    return null;
  }
}

export async function fetchStreak(): Promise<Streak> {
  const { data } = await apiClient.get<Streak>('/users/me/streak');
  return data;
}

export async function fetchProfileStats(): Promise<ProfileStats> {
  const { data } = await apiClient.get<ProfileStats>('/users/me/stats');
  return data;
}

export async function fetchMilestones(): Promise<Milestone[]> {
  const { data } = await apiClient.get<Milestone[]>('/users/me/milestones');
  return data;
}

export async function fetchFamilyMembers(): Promise<FamilyMember[]> {
  const { data } = await apiClient.get<FamilyMember[]>('/vault/members');
  return data;
}

export async function fetchVaultStories(): Promise<Story[]> {
  const { data } = await apiClient.get<Story[]>('/vault/stories');
  return data.map(normalizeStory);
}

export async function fetchTimeCapsules(): Promise<TimeCapsule[]> {
  return []; // post-MVP — the vault renders its empty state
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  const { data } = await apiClient.get<AppNotification[]>('/notifications');
  return data;
}

export async function searchStories(query: string): Promise<Story[]> {
  if (!query.trim()) return [];
  const { data } = await apiClient.get<Story[]>('/stories/search', {
    params: { q: query, productSlug: PRODUCT_SLUG },
  });
  return data.map(normalizeStory);
}

// ── Story mutations ──────────────────────────────────────────────────────────

export async function createStory(input: CreateStoryInput): Promise<CreatedStory> {
  const { data } = await apiClient.post<CreatedStory>('/stories', {
    productSlug: PRODUCT_SLUG,
    ...input,
  });
  return data;
}

export async function uploadStoryVoice(
  storyId: string,
  blob: Blob,
  durationSeconds: number,
): Promise<{ audioUrl: string }> {
  const form = new FormData();
  const ext = blob.type.includes('mp4') ? 'm4a' : 'webm';
  form.append('file', blob, `story.${ext}`);
  form.append('durationSeconds', String(Math.round(durationSeconds)));
  const { data } = await apiClient.post<{ audioUrl: string }>(
    `/stories/${storyId}/voice`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

export async function processStory(storyId: string): Promise<void> {
  await apiClient.post(`/stories/${storyId}/process`);
}

export async function fetchStoryStatus(storyId: string): Promise<StoryStatus> {
  const { data } = await apiClient.get<StoryStatus>(`/stories/${storyId}/status`);
  return data;
}

export async function updateStory(
  storyId: string,
  input: Partial<Pick<CreateStoryInput, 'title' | 'text' | 'visibility' | 'tags'>>,
): Promise<Story> {
  const { data } = await apiClient.patch<Story>(`/stories/${storyId}`, input);
  return normalizeStory(data);
}

export async function deleteStory(storyId: string): Promise<void> {
  await apiClient.delete(`/stories/${storyId}`);
}

export async function recordStoryView(storyId: string): Promise<void> {
  try {
    await apiClient.post(`/stories/${storyId}/view`);
  } catch {
    // view tracking must never break reading
  }
}

export async function fetchLikedStories(): Promise<Story[]> {
  const { data } = await apiClient.get<Story[]>('/stories/liked');
  return data.map(normalizeStory);
}

export async function fetchFavouriteStories(): Promise<Story[]> {
  const { data } = await apiClient.get<Story[]>('/stories/favourites');
  return data.map(normalizeStory);
}

export async function toggleStoryFavourite(storyId: string): Promise<{ hasFavourited: boolean }> {
  const { data } = await apiClient.post<{ hasFavourited: boolean }>(`/stories/${storyId}/favourite`);
  return data;
}

export async function fetchStoryTranslation(
  storyId: string,
  lang: string,
): Promise<import('../types/contracts').StoryTranslation> {
  const { data } = await apiClient.get<import('../types/contracts').StoryTranslation>(
    `/stories/${storyId}/translation`,
    { params: { lang } },
  );
  return data;
}

export async function fetchStoryComments(
  storyId: string,
): Promise<import('../types/contracts').StoryComment[]> {
  const { data } = await apiClient.get<import('../types/contracts').StoryComment[]>(
    `/stories/${storyId}/comments`,
  );
  return data;
}

export async function addStoryComment(
  storyId: string,
  body: string,
): Promise<import('../types/contracts').StoryComment> {
  const { data } = await apiClient.post<import('../types/contracts').StoryComment>(
    `/stories/${storyId}/comments`,
    { body },
  );
  return data;
}

export async function deleteStoryComment(storyId: string, commentId: string): Promise<void> {
  await apiClient.delete(`/stories/${storyId}/comments/${commentId}`);
}

export async function reportStory(
  storyId: string,
  reason: string,
  details?: string,
): Promise<void> {
  await apiClient.post(`/stories/${storyId}/report`, { reason, details });
}

export async function toggleStoryHeart(storyId: string): Promise<HeartResult> {
  const { data } = await apiClient.post<HeartResult>(`/stories/${storyId}/heart`);
  return data;
}

// ── Vault ────────────────────────────────────────────────────────────────────

export async function createVaultInvite(displayName?: string, relationship?: string): Promise<VaultInvite> {
  const { data } = await apiClient.post<VaultInvite>('/vault/invites', {
    displayName,
    relationship,
  });
  return data;
}

export async function acceptVaultInvite(token: string): Promise<{ ownerName: string }> {
  const { data } = await apiClient.post<{ ownerUserId: string; ownerName: string }>(
    `/vault/invites/${token}/accept`,
  );
  return data;
}

export async function removeFamilyMember(memberId: string): Promise<void> {
  await apiClient.delete(`/vault/members/${memberId}`);
}

// ── Notifications ────────────────────────────────────────────────────────────

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.post(`/notifications/${id}/read`);
}

// ── Billing ──────────────────────────────────────────────────────────────────

export async function fetchBillingPlans(): Promise<BillingPlan[]> {
  const { data } = await apiClient.get<BillingPlan[]>('/billing/plans');
  return data;
}

export async function fetchBillingStatus(): Promise<BillingStatus> {
  const { data } = await apiClient.get<BillingStatus>('/billing/status');
  return data;
}

export async function createCheckoutSession(planKey: string): Promise<CheckoutSession> {
  const origin = window.location.origin;
  const { data } = await apiClient.post<CheckoutSession>('/billing/checkout-session', {
    planKey,
    successUrl: `${origin}/upgrade/success`,
    cancelUrl: `${origin}/upgrade`,
  });
  return data;
}

export async function createPortalSession(): Promise<CheckoutSession> {
  const { data } = await apiClient.post<CheckoutSession>('/billing/portal-session', {
    returnUrl: `${window.location.origin}/profile`,
  });
  return data;
}
