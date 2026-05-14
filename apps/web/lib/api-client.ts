import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let apiClient: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include JWT token
    apiClient.interceptors.request.use(
      async (config) => {
        // Get token from Clerk or session storage
        const token = localStorage.getItem('clerk_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Add response interceptor for error handling
    apiClient.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          typeof window !== 'undefined' && window.location.reload();
        }
        return Promise.reject(error);
      },
    );
  }

  return apiClient;
}

// API methods
export const api = {
  // Auth
  getCurrentUser: () => getApiClient().get('/auth/me'),
  completeOnboarding: (data: any) =>
    getApiClient().post('/auth/onboarding', data),

  // Users
  getUserById: (id: string) => getApiClient().get(`/users/${id}`),
  getUserByUsername: (username: string) =>
    getApiClient().get(`/users/username/${username}`),
  updateProfile: (id: string, data: any) =>
    getApiClient().put(`/users/${id}`, data),
  searchUsers: (query: string) =>
    getApiClient().get(`/users/search/${query}`),

  // Posts
  getFeed: (skip = 0, take = 20) =>
    getApiClient().get('/posts', { params: { skip, take } }),
  getPost: (id: string) => getApiClient().get(`/posts/${id}`),
  createPost: (data: any) => getApiClient().post('/posts', data),
  updatePost: (id: string, data: any) =>
    getApiClient().put(`/posts/${id}`, data),
  deletePost: (id: string) => getApiClient().delete(`/posts/${id}`),
  searchPosts: (query: string, tags: string[], skip = 0, take = 20) =>
    getApiClient().get(`/posts/search/${query}`, {
      params: { tags: tags.join(','), skip, take },
    }),
  likePost: (id: string) => getApiClient().post(`/posts/${id}/like`),
  savePost: (id: string) => getApiClient().post(`/posts/${id}/save`),

  // Comments
  getComments: (postId: string) =>
    getApiClient().get(`/comments/post/${postId}`),
  createComment: (postId: string, content: string) =>
    getApiClient().post('/comments', { postId, content }),
  deleteComment: (id: string) => getApiClient().delete(`/comments/${id}`),
  likeComment: (id: string) => getApiClient().post(`/comments/${id}/like`),

  // Discussions
  getDiscussionByPostId: (postId: string) =>
    getApiClient().get(`/discussions/post/${postId}`),
  getDiscussionMessages: (discussionId: string, skip = 0, take = 50) =>
    getApiClient().get(`/discussions/${discussionId}/messages`, {
      params: { skip, take },
    }),
  joinDiscussion: (discussionId: string) =>
    getApiClient().post(`/discussions/${discussionId}/join`),
  leaveDiscussion: (discussionId: string) =>
    getApiClient().delete(`/discussions/${discussionId}/leave`),

  // Notifications
  getNotifications: () => getApiClient().get('/notifications'),
  getUnreadCount: () => getApiClient().get('/notifications/unread-count'),
  markNotificationAsRead: (id: string) =>
    getApiClient().put(`/notifications/${id}/read`),
  markAllAsRead: () => getApiClient().put('/notifications/read-all'),
  deleteNotification: (id: string) =>
    getApiClient().delete(`/notifications/${id}`),

  // Search
  search: (query: string, type?: string, skills?: string[]) =>
    getApiClient().get('/search', {
      params: { q: query, type, skills: skills?.join(',') },
    }),
};

export default api;
