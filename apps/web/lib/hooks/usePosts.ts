import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchWithToken(path: string, token: string | null, options?: RequestInit) {
  const { headers: extraHeaders, ...rest } = options ?? {};
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(extraHeaders ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export interface Post {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  visibility: string;
  tags: string[];
  attachments?: { name: string; url: string; size: number; type: string }[];
  teamSize?: number;
  deadline?: string;
  budget?: string;
  repositoryUrl?: string;
  createdAt: string;
  author: { id: string; username: string; avatarUrl?: string };
  _count: { comments: number; likes: number };
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface CreatePostInput {
  title: string;
  description: string;
  type: string;
  status?: string;
  visibility?: string;
  tags?: string[];
  requiredSkillIds?: string[];
  teamSize?: number;
  deadline?: string;
  budget?: string;
  repositoryUrl?: string;
  attachments?: any[];
}

export function usePosts(skip = 0, take = 20) {
  const { getToken } = useAuth();
  return useQuery<Post[]>({
    queryKey: ['posts', skip, take],
    queryFn: async () => {
      const token = await getToken();
      const data = await fetchWithToken(`/posts?skip=${skip}&take=${take}`, token);
      return data.posts as Post[];
    },
  });
}

export function usePost(postId: string) {
  const { getToken } = useAuth();
  return useQuery<Post>({
    queryKey: ['post', postId],
    queryFn: async () => {
      const token = await getToken();
      const data = await fetchWithToken(`/posts/${postId}`, token);
      return data.post ?? data;
    },
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreatePostInput & { userId?: string }) => {
      const { userId, ...body } = input as any;
      const token = await getToken();
      return fetchWithToken('/posts', token, { method: 'POST', body: JSON.stringify(body) });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
}

export function useLikePost() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const token = await getToken();
      return fetchWithToken(`/posts/${postId}/like`, token, { method: 'POST' });
    },
    onSuccess: (data, postId) => {
      // Update like count in all post caches
      qc.setQueriesData({ queryKey: ['posts'] }, (old: Post[] | undefined) =>
        old?.map((p) => p.id === postId
          ? { ...p, _count: { ...p._count, likes: p._count.likes + (data.liked ? 1 : -1) }, isLiked: data.liked }
          : p
        )
      );
      qc.setQueryData(['post', postId], (old: Post | undefined) =>
        old ? { ...old, _count: { ...old._count, likes: old._count.likes + (data.liked ? 1 : -1) }, isLiked: data.liked } : old
      );
    },
  });
}

export function useSavePost() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const token = await getToken();
      return fetchWithToken(`/posts/${postId}/save`, token, { method: 'POST' });
    },
    onSuccess: (data, postId) => {
      qc.setQueriesData({ queryKey: ['posts'] }, (old: Post[] | undefined) =>
        old?.map((p) => p.id === postId ? { ...p, isSaved: data.saved } : p)
      );
      qc.setQueryData(['post', postId], (old: Post | undefined) =>
        old ? { ...old, isSaved: data.saved } : old
      );
      qc.invalidateQueries({ queryKey: ['saved-posts'] });
    },
  });
}

export function useSavedPosts() {
  const { getToken } = useAuth();
  return useQuery<Post[]>({
    queryKey: ['saved-posts'],
    queryFn: async () => {
      const token = await getToken();
      const data = await fetchWithToken('/posts/saved', token);
      return data.posts ?? data;
    },
  });
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; username: string; avatarUrl?: string };
  _count?: { likes: number };
}

export function usePostComments(postId: string) {
  const { getToken } = useAuth();
  return useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const token = await getToken();
      const data = await fetchWithToken(`/comments/post/${postId}`, token);
      return data.comments ?? data;
    },
    enabled: !!postId,
  });
}

export function useCreateComment() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { content: string; postId: string; userId?: string }) => {
      const token = await getToken();
      return fetchWithToken('/comments', token, {
        method: 'POST',
        body: JSON.stringify({ content: input.content, postId: input.postId }),
      });
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['comments', vars.postId] }),
  });
}
