import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/types';
import { api } from '@/lib/api-client';
import { useUser } from '@clerk/nextjs';

export function useAuth() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth/me'],
    queryFn: async () => {
      try {
        const response = await api.getCurrentUser();
        return response.data.user as User;
      } catch (err) {
        return null;
      }
    },
    enabled: !!isSignedIn && !!isLoaded,
    retry: false,
  });

  useEffect(() => {
    setIsAuthenticated(!!user && !!isSignedIn);
  }, [user, isSignedIn]);

  const logout = async () => {
    // Clerk signOut is available through window
    window.location.href = '/sign-out';
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || !isLoaded,
    error,
    userId: clerkUser?.id,
    logout,
    isSignedIn: !!isSignedIn,
  };
}
