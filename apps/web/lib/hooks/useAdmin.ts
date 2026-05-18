'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'peerforge_admin_token';

export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function adminFetch(path: string, options?: RequestInit) {
  const token = getAdminToken();
  const res = await fetch(`${API_URL}/admin${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status}`);
  }
  return res.json();
}

export function useAdminLogin() {
  const router = useRouter();
  return useMutation({
    mutationFn: (creds: { email: string; password: string }) =>
      adminFetch('/login', { method: 'POST', body: JSON.stringify(creds) }),
    onSuccess: (data) => {
      setAdminToken(data.token);
      router.push('/admin');
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminFetch('/stats'),
    enabled: !!getAdminToken(),
    refetchInterval: 30_000,
  });
}

export function useAdminUsers(skip = 0, take = 20, search = '') {
  return useQuery({
    queryKey: ['admin-users', skip, take, search],
    queryFn: () => adminFetch(`/users?skip=${skip}&take=${take}&search=${encodeURIComponent(search)}`),
    enabled: !!getAdminToken(),
  });
}

export function useAdminDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminFetch(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useAdminPosts(skip = 0, take = 20, search = '') {
  return useQuery({
    queryKey: ['admin-posts', skip, take, search],
    queryFn: () => adminFetch(`/posts?skip=${skip}&take=${take}&search=${encodeURIComponent(search)}`),
    enabled: !!getAdminToken(),
  });
}

export function useAdminDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminFetch(`/posts/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-posts'] }),
  });
}

export function useAdminReports(status?: string) {
  return useQuery({
    queryKey: ['admin-reports', status],
    queryFn: () => adminFetch(`/reports${status ? `?status=${status}` : ''}`),
    enabled: !!getAdminToken(),
    refetchInterval: 15_000,
  });
}

export function useAdminReportCount() {
  return useQuery({
    queryKey: ['admin-report-count'],
    queryFn: () => adminFetch('/reports/count'),
    enabled: !!getAdminToken(),
    refetchInterval: 15_000,
  });
}

export function useAdminUpdateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'REVIEWED' | 'DISMISSED' }) =>
      adminFetch(`/reports/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      qc.invalidateQueries({ queryKey: ['admin-report-count'] });
    },
  });
}

export function useAdminLogout() {
  const router = useRouter();
  return useCallback(() => {
    clearAdminToken();
    router.push('/admin/login');
  }, [router]);
}
