import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Post {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  visibility: string;
  tags: string[] | null;
  teamSize?: number;
  deadline?: string;
  budget?: string;
  repositoryUrl?: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  _count: {
    comments: number;
    likes: number;
  };
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
}

export function usePosts(skip = 0, take = 20) {
  return useQuery({
    queryKey: ['posts', skip, take],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/posts?skip=${skip}&take=${take}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const data = await response.json();
      return data.posts as Post[];
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePostInput & { userId?: string }) => {
      const { userId, ...body } = input as any;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (userId) {
        headers['x-user-id'] = userId;
      } else {
        headers['x-user-id'] = 'dev-user-' + Math.random().toString(36).substr(2, 9);
      }

      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create post');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function usePost(postId: string) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch post: ${response.statusText}`);
      }

      return response.json() as Promise<Post>;
    },
  });
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  _count?: {
    likes: number;
  };
}

export function usePostComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/comments/post/${postId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }

      return response.json() as Promise<Comment[]>;
    },
  });
}

export interface CreateCommentInput {
  content: string;
  postId: string;
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: CreateCommentInput & { userId?: string }
    ) => {
      const { userId, postId, content } = input as any;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (userId) {
        headers['x-user-id'] = userId;
      } else {
        headers['x-user-id'] = 'dev-user-' + Math.random().toString(36).substr(2, 9);
      }

      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ content, postId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create comment');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.postId],
      });
    },
  });
}
