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
  message?: string;
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

export function useMarkNotificationRead() {
  const apiFetch = useApiFetch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),
    onMutate: async (id) => {
      // Optimistic: flip read=true in the cached list so the sidebar badge
      // decrements immediately, without waiting for the server roundtrip.
      await qc.cancelQueries({ queryKey: ['notifications'] });
      const previous = qc.getQueryData<AppNotification[]>(['notifications']);
      qc.setQueryData<AppNotification[]>(['notifications'], (old) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(['notifications'], ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
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
    staleTime: 0,
    refetchInterval: 10_000,
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
      qc.setQueryData(['current-user'], (old: AppUser | null) => ({
        ...(old ?? {}),
        ...updatedUser,
      }));
      qc.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
}

// ── Collaborations ───────────────────────────────────────────
export interface Collaboration {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message?: string;
  createdAt: string;
  user?: { id: string; username: string; avatarUrl?: string };
  post?: { id: string; title: string; type: string };
}

export function useCollaborationStatus(postId: string) {
  const apiFetch = useApiFetch();
  const { isSignedIn } = useAuth();
  return useQuery<{ status: string | null; id: string | null }>({
    queryKey: ['collab-status', postId],
    queryFn: () => apiFetch(`/collaborations/posts/${postId}/status`),
    enabled: !!isSignedIn && !!postId,
  });
}

export function usePostCollaborations(postId: string) {
  const apiFetch = useApiFetch();
  return useQuery<Collaboration[]>({
    queryKey: ['collaborations', postId],
    queryFn: () => apiFetch(`/collaborations/posts/${postId}`).then((d) => d.collaborations ?? d),
    enabled: !!postId,
  });
}

export function useRequestCollaboration() {
  const apiFetch = useApiFetch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, message }: { postId: string; message?: string }) =>
      apiFetch(`/collaborations/posts/${postId}/request`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    onSuccess: (_, { postId }) => {
      qc.invalidateQueries({ queryKey: ['collab-status', postId] });
      qc.invalidateQueries({ queryKey: ['collaborations', postId] });
    },
  });
}

export function useRespondCollaboration() {
  const apiFetch = useApiFetch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accept, postId }: { id: string; accept: boolean; postId: string }) =>
      apiFetch(`/collaborations/${id}/respond`, {
        method: 'PUT',
        body: JSON.stringify({ accept }),
      }),
    onSuccess: (_, { postId }) => {
      qc.invalidateQueries({ queryKey: ['collaborations', postId] });
      qc.invalidateQueries({ queryKey: ['current-user'] });
    },
  });
}

// ── Direct Messages ──────────────────────────────────────────
export interface DirectMessage {
  id: string;
  content: string;
  read: boolean;
  createdAt: string;
  senderId: string;
  receiverId: string;
  sender: { id: string; username: string; avatarUrl?: string; fullName?: string };
}

export interface DmConversation {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  read: boolean;
  partner: { id: string; username: string; avatarUrl?: string; fullName?: string };
}

export function useDmInbox() {
  const apiFetch = useApiFetch();
  const { isSignedIn } = useAuth();
  return useQuery<DmConversation[]>({
    queryKey: ['dm-inbox'],
    queryFn: () => apiFetch('/messages/inbox').then((d) => d.conversations ?? d),
    enabled: !!isSignedIn,
    refetchInterval: 5000,
  });
}

export function useDmConversation(otherUserId: string) {
  const apiFetch = useApiFetch();
  const qc = useQueryClient();
  const { isSignedIn } = useAuth();
  return useQuery<DirectMessage[]>({
    queryKey: ['dm-conversation', otherUserId],
    queryFn: async () => {
      const data = await apiFetch(`/messages/${otherUserId}`);
      const messages = data.messages ?? data;
      // The server auto-marks received messages as read when the conversation
      // is fetched — refresh the inbox cache so the sidebar badge decrements
      // immediately instead of waiting for the next 5s poll.
      qc.invalidateQueries({ queryKey: ['dm-inbox'] });
      return messages;
    },
    enabled: !!isSignedIn && !!otherUserId,
    refetchInterval: 3000,
  });
}

export function useSendDm() {
  const apiFetch = useApiFetch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ receiverId, content }: { receiverId: string; content: string }) =>
      apiFetch(`/messages/${receiverId}`, { method: 'POST', body: JSON.stringify({ content }) }),
    onSuccess: (_, { receiverId }) => {
      qc.invalidateQueries({ queryKey: ['dm-conversation', receiverId] });
      qc.invalidateQueries({ queryKey: ['dm-inbox'] });
    },
  });
}

// ── Follows ──────────────────────────────────────────────────
export function useFollowCounts(userId: string) {
  const apiFetch = useApiFetch();
  return useQuery<{ followers: number; following: number }>({
    queryKey: ['follow-counts', userId],
    queryFn: () => apiFetch(`/follows/${userId}/counts`),
    enabled: !!userId,
  });
}

export function useFollowStatus(userId: string) {
  const apiFetch = useApiFetch();
  const { isSignedIn } = useAuth();
  return useQuery<{ following: boolean }>({
    queryKey: ['follow-status', userId],
    queryFn: () => apiFetch(`/follows/${userId}/status`),
    enabled: !!isSignedIn && !!userId,
  });
}

export function useFollow(userId: string) {
  const apiFetch = useApiFetch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch(`/follows/${userId}`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['follow-status', userId] });
      qc.invalidateQueries({ queryKey: ['follow-counts', userId] });
      qc.invalidateQueries({ queryKey: ['current-user'] });
      // Followee receives +1 reputation — refresh their profile cache
      qc.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
}
