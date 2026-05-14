import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Hook-based fetcher that attaches the Clerk token
function useApiFetch() {
  const { getToken } = useAuth();

  return async (path: string, options?: RequestInit) => {
    const token = await getToken();
    const res = await fetch(`${API_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      ...options,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };
}

// ── Discussions ──────────────────────────────────────────────
export interface DiscussionRoom {
  id: string;
  name: string;
  description?: string;
  type: string;
  memberCount: number;
  messageCount: number;
  updatedAt: string;
  post?: { id: string; title: string };
}

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; username: string; avatarUrl?: string };
}

export function useDiscussions() {
  const apiFetch = useApiFetch();
  return useQuery<DiscussionRoom[]>({
    queryKey: ['discussions'],
    queryFn: () => apiFetch('/discussions').then((d) => d.discussions ?? d),
  });
}

export function useDiscussion(id: string) {
  const apiFetch = useApiFetch();
  return useQuery<DiscussionRoom>({
    queryKey: ['discussion', id],
    queryFn: () => apiFetch(`/discussions/${id}`).then((d) => d.discussion ?? d),
    enabled: !!id,
  });
}

export function useDiscussionMessages(id: string) {
  const apiFetch = useApiFetch();
  return useQuery<ChatMessage[]>({
    queryKey: ['discussion-messages', id],
    queryFn: () => apiFetch(`/discussions/${id}/messages`).then((d) => d.messages ?? d),
    enabled: !!id,
    refetchInterval: 3000,
  });
}

// ── Notifications ────────────────────────────────────────────
export interface AppNotification {
  id: string;
  type: string;
  title: string;
  description?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const apiFetch = useApiFetch();
  return useQuery<AppNotification[]>({
    queryKey: ['notifications'],
    queryFn: () => apiFetch('/notifications').then((d) => d.notifications ?? d),
  });
}

export function useMarkAllRead() {
  const apiFetch = useApiFetch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch('/notifications/read-all', { method: 'PUT' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ── Current User ─────────────────────────────────────────────
export interface AppUser {
  id: string;
  username: string;
  fullName: string;
  bio?: string;
  avatarUrl?: string;
  university?: string;
  country?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  skills: string[];
  interests: string[];
  reputation: number;
  createdAt?: string;
  _count?: { posts: number };
}

export function useCurrentUser() {
  const apiFetch = useApiFetch();
  const { isSignedIn } = useAuth();
  return useQuery<AppUser | null>({
    queryKey: ['current-user'],
    queryFn: () => apiFetch('/auth/me').then((d) => d.user ?? d).catch(() => null),
    enabled: !!isSignedIn,
  });
}

export function useUpdateProfile() {
  const apiFetch = useApiFetch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AppUser> }) =>
      apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (response) => {
      const updatedUser = response?.user ?? response;
      // Update cache immediately so profile reflects changes
      qc.setQueryData(['current-user'], (old: AppUser | null) => ({
        ...(old ?? {}),
        ...updatedUser,
      }));
      qc.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
}
